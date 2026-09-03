import "server-only";

import { prisma } from "@/lib/prisma";

export type DMMessage = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
    senderUsername?: string;
  } | null;
  sender: {
    id: string;
    name: string;
    username?: string;
    image?: string;
  };
  reactions?: {
    emoji: string;
    count: number;
    userIds: string[];
  }[];
};

export type DMConversation = {
  id: string;
  recipient: {
    id: string;
    name: string;
    username?: string;
    image?: string;
    lastSeenAt?: string | null;
  };
  messages: DMMessage[];
};

export async function getOrCreateDMConversation(
  userId1: string,
  userId2: string,
): Promise<{ id: string }> {
  // Find an existing conversation that has both members
  const existingConversations = await prisma.conversation.findMany({
    where: {
      AND: [
        { members: { some: { userId: userId1 } } },
        { members: { some: { userId: userId2 } } },
      ],
    },
    select: { id: true },
    take: 1,
  });

  if (existingConversations.length > 0 && existingConversations[0]) {
    return { id: existingConversations[0].id };
  }

  // Create a new conversation with both users
  const conversation = await prisma.conversation.create({
    data: {
      members: {
        create: [{ userId: userId1 }, { userId: userId2 }],
      },
    },
    select: { id: true },
  });

  return { id: conversation.id };
}

export async function getDMConversation(
  conversationId: string,
  currentUserId: string,
): Promise<DMConversation | null> {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                lastSeenAt: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) return null;

    const isMember = conversation.members.some(
      (m) => m.userId === currentUserId,
    );
    if (!isMember) return null;

    const recipientMember = conversation.members.find(
      (m) => m.userId !== currentUserId,
    );

    const recipient = recipientMember?.user ?? {
      id: currentUserId,
      name: "Notes to Self",
      username: undefined,
      image: null,
      lastSeenAt: null,
    };

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

    const messages: DMMessage[] = rawMessages.map((m) => {
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

    return {
      id: conversation.id,
      recipient: {
        id: recipient.id,
        name: recipient.username
          ? `@${recipient.username}`
          : recipient.name ?? "Teammate",
        username: recipient.username ?? undefined,
        image: recipient.image ?? undefined,
        lastSeenAt: recipient.lastSeenAt?.toISOString() ?? null,
      },
      messages,
    };
  } catch (error) {
    console.error("[DM Service] Error getting conversation:", error);
    return null;
  }
}

export async function getDMConversationByRecipient(
  currentUserId: string,
  recipientIdOrUsername: string,
): Promise<DMConversation | null> {
  try {
    let cleanId = recipientIdOrUsername.trim();
    if (cleanId.startsWith("@")) {
      cleanId = cleanId.substring(1);
    }

    const recipient = await prisma.user.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { username: { equals: cleanId, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });

    if (!recipient) return null;

    const conv = await getOrCreateDMConversation(currentUserId, recipient.id);
    return await getDMConversation(conv.id, currentUserId);
  } catch (error) {
    console.error("[DM Service] Error by recipient:", error);
    return null;
  }
}

export type DMListItem = {
  conversationId: string;
  recipient: {
    id: string;
    name: string;
    username?: string;
    image?: string;
    lastSeenAt?: string | null;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
};

export type TeammateItem = {
  id: string;
  name: string;
  username?: string;
  image?: string;
  teamName: string;
};

export async function getUserDMList(userId: string): Promise<DMListItem[]> {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                lastSeenAt: true,
              },
            },
          },
        },
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
    });

    const list: DMListItem[] = [];

    for (const conv of conversations) {
      const recipientMember = conv.members.find((m) => m.userId !== userId);
      const recipient = recipientMember?.user;
      if (!recipient) continue;

      const lastMsg = conv.messages[0];

      list.push({
        conversationId: conv.id,
        recipient: {
          id: recipient.id,
          name:
            recipient.name ||
            (recipient.username ? `@${recipient.username}` : "Teammate"),
          username: recipient.username ?? undefined,
          image: recipient.image ?? undefined,
          lastSeenAt: recipient.lastSeenAt?.toISOString() ?? null,
        },
        lastMessage: lastMsg
          ? {
              content: lastMsg.content,
              createdAt: lastMsg.createdAt.toISOString(),
              senderId: lastMsg.senderId,
            }
          : null,
      });
    }

    // Sort by latest message date descending
    list.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const timeB = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return timeB - timeA;
    });

    return list;
  } catch (error) {
    console.error("[DM Service] Error getting user DM list:", error);
    return [];
  }
}

export async function getRecentTeammates(
  userId: string,
): Promise<TeammateItem[]> {
  try {
    const userTeams = await prisma.teamMember.findMany({
      where: { userId },
      select: { teamId: true },
    });

    const teamIds = userTeams.map((t) => t.teamId);
    if (teamIds.length === 0) return [];

    const otherMembers = await prisma.teamMember.findMany({
      where: {
        teamId: { in: teamIds },
        userId: { not: userId },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        team: {
          select: {
            name: true,
          },
        },
      },
    });

    const uniqueMap = new Map<string, TeammateItem>();
    for (const m of otherMembers) {
      if (!uniqueMap.has(m.userId)) {
        uniqueMap.set(m.userId, {
          id: m.user.id,
          name:
            m.user.name ||
            (m.user.username ? `@${m.user.username}` : "Teammate"),
          username: m.user.username ?? undefined,
          image: m.user.image ?? undefined,
          teamName: m.team.name,
        });
      }
    }

    return Array.from(uniqueMap.values());
  } catch (error) {
    console.error("[DM Service] Error getting recent teammates:", error);
    return [];
  }
}

