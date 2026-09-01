import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createTeamNotification } from "@/services/notification-service";

type RouteContext = {
  params: Promise<{
    teamId: string;
    channelId: string;
  }>;
};

const VALID_MESSAGE_TYPES = ["NORMAL", "ANNOUNCEMENT", "TASK"] as const;

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, channelId } = await params;

    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
        teamId,
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 100);

    const [messages, tasks] = await Promise.all([
      prisma.message.findMany({
        where: {
          channelId,
          deletedAt: null,
          ...(search ? { content: { contains: search, mode: "insensitive" } } : {}),
        },
        orderBy: {
          createdAt: "asc",
        },
        take: limit,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      }),
      prisma.task.findMany({
        where: { teamId },
        select: { id: true, completed: true },
      }),
    ]);

    const taskMap = new Map(tasks.map((t) => [t.id, t.completed]));

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        type: m.type,
        deadline: m.deadline?.toISOString() ?? undefined,
        completed: m.type === "TASK" ? (taskMap.get(m.id) ?? false) : undefined,
        createdAt: m.createdAt.toISOString(),
        sender: {
          id: m.sender.id,
          name: m.sender.username ? `@${m.sender.username}` : (m.sender.name ?? "Unknown"),
          username: m.sender.username ?? undefined,
          image: m.sender.image ?? undefined,
        },
      })),
      nextCursor: messages.length === limit ? messages[messages.length - 1]?.id : undefined,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, channelId } = await params;

    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
        teamId,
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    if (content.length > 4000) {
      return NextResponse.json({ error: "Message must be 4000 characters or less" }, { status: 400 });
    }

    const type = VALID_MESSAGE_TYPES.includes(body.type as any) ? body.type : "NORMAL";

    let parsedDeadline = null;
    if (type === "TASK" && typeof body.deadline === "string") {
      const deadline = new Date(body.deadline);
      if (!isNaN(deadline.getTime())) {
        parsedDeadline = deadline;
      }
    }

    const message = await prisma.message.create({
      data: {
        content,
        type,
        channelId,
        senderId: session.user.id,
        ...(parsedDeadline ? { deadline: parsedDeadline } : {}),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    // If it's a TASK, sync it to the team's tasks list
    if (type === "TASK") {
      await prisma.task.create({
        data: {
          id: message.id,
          title: content,
          completed: false,
          teamId,
        },
      }).catch((err) => {
        console.error("Failed to sync task from chat message:", err);
      });
    }

    await prisma.channelRead.upsert({
      where: {
        channelId_userId: {
          channelId,
          userId: session.user.id,
        },
      },
      update: {
        lastReadAt: message.createdAt,
      },
      create: {
        channelId,
        userId: session.user.id,
        lastReadAt: message.createdAt,
      },
    });

    // Notify other team members
    const senderDisplayName =
      message.sender.name || (message.sender.username ? `@${message.sender.username}` : "A teammate");
    let notifTitle = `#${channel.name}`;
    let notifType = "MESSAGE";
    let notifLink = `/teams/${teamId}/channels/${channelId}`;

    if (type === "ANNOUNCEMENT") {
      notifTitle = `Announcement in #${channel.name}`;
      notifType = "ANNOUNCEMENT";
    } else if (type === "TASK") {
      notifTitle = `New Task in #${channel.name}`;
      notifType = "TASK_CREATED";
      notifLink = `/teams/${teamId}/info`;
    }

    createTeamNotification({
      teamId,
      excludeUserId: session.user.id,
      title: notifTitle,
      message: `${senderDisplayName}: ${content.slice(0, 120)}${content.length > 120 ? "..." : ""}`,
      type: notifType,
      link: notifLink,
    }).catch((err) => {
      console.error("Failed to create message notifications:", err);
    });

    return NextResponse.json(
      {
        message: {
          id: message.id,
          content: message.content,
          type: message.type,
          deadline: message.deadline?.toISOString() ?? undefined,
          completed: type === "TASK" ? false : undefined,
          createdAt: message.createdAt.toISOString(),
          sender: {
            id: message.sender.id,
            name: message.sender.username ? `@${message.sender.username}` : (message.sender.name ?? "Unknown"),
            username: message.sender.username ?? undefined,
            image: message.sender.image ?? undefined,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, channelId } = await params;
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.channelId !== channelId) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (message.senderId !== session.user.id && membership.role !== "ADMIN") {
      return NextResponse.json({ error: "Cannot delete this message" }, { status: 403 });
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });

    await prisma.task.deleteMany({
      where: { id: messageId },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
