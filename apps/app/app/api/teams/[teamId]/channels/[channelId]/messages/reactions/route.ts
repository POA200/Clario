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

export const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"] as const;

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
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
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

    if (!message || message.channelId !== channelId || message.deletedAt) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user already reacted with this emoji
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
      // Toggle off / remove reaction
      await prisma.messageReaction.delete({
        where: { id: existing.id },
      });
    } else {
      // Add reaction
      await prisma.messageReaction.create({
        data: {
          messageId,
          userId: session.user.id,
          emoji,
        },
      });
    }

    // Fetch all current reactions for this message to return formatted summary
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

    const reactions = Array.from(reactionMap.entries()).map(([em, userIds]) => ({
      emoji: em,
      count: userIds.length,
      userIds,
    }));

    return NextResponse.json({ success: true, reactions });
  } catch (error) {
    console.error("Error toggling message reaction:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

