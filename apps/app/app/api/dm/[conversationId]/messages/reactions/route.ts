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

const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"] as const;

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

    const body = (await request.json().catch(() => ({}))) as {
      messageId?: string;
      emoji?: string;
    };

    const { messageId, emoji } = body;

    if (!messageId || !emoji || !ALLOWED_EMOJIS.includes(emoji as any)) {
      return NextResponse.json(
        { error: "Valid messageId and allowed emoji are required" },
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

    // Toggle reaction
    const existing = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: session.user.id,
          emoji,
        },
      },
    });

    if (existing) {
      await prisma.messageReaction.delete({
        where: { id: existing.id },
      });
    } else {
      await prisma.messageReaction.create({
        data: {
          messageId,
          userId: session.user.id,
          emoji,
        },
      });

      // Notify message author if not reacting to own message
      if (message.senderId !== session.user.id) {
        try {
          const senderUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, username: true },
          });
          const reactorName =
            senderUser?.name ||
            (senderUser?.username ? `@${senderUser.username}` : "A teammate");

          await createNotification({
            userId: message.senderId,
            title: "New Reaction",
            message: `${reactorName} reacted ${emoji} to your direct message`,
            type: "MESSAGE",
            link: `/dm/${session.user.id}`,
          });
        } catch (notifErr) {
          console.error("[DM Reaction API] Error creating notification:", notifErr);
        }
      }
    }

    // Fetch all current reactions for this message
    const allReactions = await prisma.messageReaction.findMany({
      where: { messageId },
      select: { emoji: true, userId: true },
    });

    const reactionMap = new Map<string, string[]>();
    for (const r of allReactions) {
      const list = reactionMap.get(r.emoji) || [];
      list.push(r.userId);
      reactionMap.set(r.emoji, list);
    }

    const reactions = Array.from(reactionMap.entries()).map(
      ([em, userIds]) => ({
        emoji: em,
        count: userIds.length,
        userIds,
      }),
    );

    return NextResponse.json({ success: true, reactions });
  } catch (error) {
    console.error("[DM API] Error toggling reaction:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

