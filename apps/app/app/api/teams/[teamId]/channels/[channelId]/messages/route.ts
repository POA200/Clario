import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    teamId: string;
    channelId: string;
  }>;
};

const VALID_MESSAGE_TYPES = ['NORMAL', 'ANNOUNCEMENT', 'TASK'] as const;

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
    const search = searchParams.get('search');
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 100);

    const messages = await prisma.message.findMany({
      where: {
        channelId,
        deletedAt: null,
        ...(search ? { content: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: {
        createdAt: 'asc',
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
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        type: m.type,
        deadline: m.deadline?.toISOString() ?? undefined,
        createdAt: m.createdAt.toISOString(),
        sender: {
          id: m.sender.id,
          name: m.sender.username ? `@${m.sender.username}` : (m.sender.name ?? 'Unknown'),
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
    const content = typeof body.content === 'string' ? body.content.trim() : '';

    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    if (content.length > 4000) {
      return NextResponse.json({ error: "Message must be 4000 characters or less" }, { status: 400 });
    }

    const type = VALID_MESSAGE_TYPES.includes(body.type as any) ? body.type : 'NORMAL';

    let parsedDeadline = null;
    if (type === 'TASK' && typeof body.deadline === 'string') {
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

    return NextResponse.json(
      {
        message: {
          id: message.id,
          content: message.content,
          type: message.type,
          deadline: message.deadline?.toISOString() ?? undefined,
          createdAt: message.createdAt.toISOString(),
          sender: {
            id: message.sender.id,
            name: message.sender.username ? `@${message.sender.username}` : (message.sender.name ?? 'Unknown'),
            username: message.sender.username ?? undefined,
            image: message.sender.image ?? undefined,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
