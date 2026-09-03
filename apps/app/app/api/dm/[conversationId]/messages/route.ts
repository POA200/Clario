import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/services/notification-service";

type RouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rawMessages = await prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        reactions: {
          select: {
            emoji: true,
            userId: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    const messages = rawMessages.map((m) => {
      const reactionMap = new Map<string, string[]>();
      for (const r of m.reactions) {
        const list = reactionMap.get(r.emoji) || [];
        list.push(r.userId);
        reactionMap.set(r.emoji, list);
      }

      const reactions = Array.from(reactionMap.entries()).map(
        ([emoji, userIds]) => ({
          emoji,
          count: userIds.length,
          userIds,
        }),
      );

      return {
        id: m.id,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
        reactions,
        replyTo: m.replyTo
          ? {
              id: m.replyTo.id,
              content: m.replyTo.content,
              senderName:
                m.replyTo.sender.name ||
                (m.replyTo.sender.username
                  ? `@${m.replyTo.sender.username}`
                  : "Teammate"),
              senderUsername: m.replyTo.sender.username ?? undefined,
            }
          : null,
        sender: {
          id: m.sender.id,
          name: m.sender.username
            ? `@${m.sender.username}`
            : m.sender.name ?? "Unknown",
          username: m.sender.username ?? undefined,
          image: m.sender.image ?? undefined,
        },
      };
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[DM API] Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const content =
      typeof body.content === "string" ? body.content.trim() : "";
    const replyToId = typeof body.replyToId === "string" ? body.replyToId : null;

    if (!content) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 },
      );
    }

    if (content.length > 4000) {
      return NextResponse.json(
        { error: "Message must be 4000 characters or less" },
        { status: 400 },
      );
    }

    const message = await prisma.message.create({
      data: {
        content,
        type: "NORMAL",
        conversationId,
        senderId: session.user.id,
        replyToId: replyToId ?? undefined,
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
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    // Notify recipient in the DM conversation
    try {
      const recipientMember = await prisma.conversationMember.findFirst({
        where: {
          conversationId,
          userId: { not: session.user.id },
        },
      });

      const senderName =
        message.sender.name ||
        (message.sender.username
          ? `@${message.sender.username}`
          : "A teammate");
      const snippet =
        content.length > 100 ? `${content.substring(0, 100)}...` : content;

      if (recipientMember) {
        await createNotification({
          userId: recipientMember.userId,
          title: `Direct message from ${senderName}`,
          message: snippet,
          type: "MESSAGE",
          link: `/dm/${session.user.id}`,
        });
      }

      // Check @mentions
      const mentionMatches = [...content.matchAll(/@([a-zA-Z0-9_]+)/g)];
      const mentionedUsernames = [
        ...new Set(mentionMatches.map((m) => m[1]?.toLowerCase())),
      ];

      if (mentionedUsernames.length > 0) {
        const mentionedUsers = await prisma.user.findMany({
          where: {
            username: { in: mentionedUsernames, mode: "insensitive" },
            id: { not: session.user.id },
          },
          select: { id: true },
        });

        for (const u of mentionedUsers) {
          if (recipientMember && u.id === recipientMember.userId) {
            // Already notified via DM notification
            continue;
          }
          await createNotification({
            userId: u.id,
            title: `${senderName} mentioned you`,
            message: `"${snippet}"`,
            type: "MESSAGE",
            link: `/dm/${session.user.id}`,
          });
        }
      }
    } catch (notifErr) {
      console.error("[DM API] Error creating notification:", notifErr);
    }

    return NextResponse.json(
      {
        message: {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
          replyTo: message.replyTo
            ? {
                id: message.replyTo.id,
                content: message.replyTo.content,
                senderName:
                  message.replyTo.sender.name ||
                  (message.replyTo.sender.username
                    ? `@${message.replyTo.sender.username}`
                    : "Teammate"),
                senderUsername: message.replyTo.sender.username ?? undefined,
              }
            : null,
          sender: {
            id: message.sender.id,
            name: message.sender.username
              ? `@${message.sender.username}`
              : message.sender.name ?? "Unknown",
            username: message.sender.username ?? undefined,
            image: message.sender.image ?? undefined,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[DM API] Error creating message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    const body = await request.json().catch(() => ({}));
    const messageId = body.messageId as string | undefined;
    const newContent = body.content as string | undefined;

    if (!messageId || typeof newContent !== "string" || !newContent.trim()) {
      return NextResponse.json(
        { error: "Message ID and content are required" },
        { status: 400 },
      );
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });

    if (
      !message ||
      message.conversationId !== conversationId ||
      message.deletedAt
    ) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 },
      );
    }

    if (message.senderId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the author can edit this message" },
        { status: 403 },
      );
    }

    // 1-hour edit timer
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    if (messageAge > 60 * 60 * 1000) {
      return NextResponse.json(
        { error: "Messages can only be edited within 1 hour of sending." },
        { status: 403 },
      );
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: newContent.trim(),
        updatedAt: new Date(),
      },
      include: {
        sender: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });

    return NextResponse.json({
      message: {
        id: updated.id,
        content: updated.content,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        sender: {
          id: updated.sender.id,
          name: updated.sender.username
            ? `@${updated.sender.username}`
            : updated.sender.name ?? "Unknown",
          username: updated.sender.username ?? undefined,
          image: updated.sender.image ?? undefined,
        },
      },
    });
  } catch (error) {
    console.error("[DM API] Error editing message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 },
      );
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (
      !message ||
      message.conversationId !== conversationId ||
      message.deletedAt
    ) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 },
      );
    }

    if (message.senderId !== session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete this message" },
        { status: 403 },
      );
    }

    // 1-hour delete timer
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    if (messageAge > 60 * 60 * 1000) {
      return NextResponse.json(
        { error: "Messages can only be deleted within 1 hour of sending." },
        { status: 403 },
      );
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DM API] Error deleting message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

