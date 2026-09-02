import "server-only";

import { prisma } from "@/lib/prisma";
import type { Team, TeamChannel } from "@/types/team";

const VALID_CHANNEL_ICONS = [
  "messages",
  "announcement",
  "design",
  "development",
] as const;

function mapChannel(
  channel: {
    id: string;
    name: string;
    icon: string;
    image?: string | null;
    channelReads?: { lastReadAt: Date }[];
    messages?: { id: string; senderId: string; createdAt: Date }[];
  },
  userId?: string,
): TeamChannel {
  const icon = channel.icon || "messages";

  let unread = false;
  if (channel.messages && channel.messages.length > 0) {
    const latestMessage = channel.messages[0];
    const lastReadAt = channel.channelReads?.[0]?.lastReadAt;

    if (lastReadAt) {
      unread =
        new Date(latestMessage.createdAt).getTime() >
          new Date(lastReadAt).getTime() &&
        latestMessage.senderId !== userId;
    } else {
      unread = latestMessage.senderId !== userId;
    }
  }

  return {
    id: channel.id,
    name: channel.name,
    icon,
    image: channel.image ?? null,
    unread,
  };
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  try {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        channels: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            channelReads: {
              where: { userId },
              take: 1,
            },
            messages: {
              where: { deletedAt: null },
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                senderId: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      avatar: team.avatar ?? undefined,
      memberCount: team.members.length,
      members: team.members.map((member) => ({
        id: member.id,
        userId: member.userId,
        name: member.user.name ?? member.user.email,
        role:
          member.userId === team.creatorId
            ? "Owner"
            : member.role === "ADMIN"
              ? "Admin"
              : "Member",
        status: "offline",
        avatar: member.user.image ?? undefined,
      })),
      channels: team.channels.map((channel) => mapChannel(channel, userId)),
    }));
  } catch (error) {
    console.error("[Team Service] Error fetching teams:", error);
    return [];
  }
}

export async function getTeam(
  teamId: string,
  userId: string,
): Promise<Team | null> {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      ...(userId
        ? {
            members: {
              some: {
                userId,
              },
            },
          }
        : {}),
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      channels: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          channelReads: {
            where: { userId },
            take: 1,
          },
          messages: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              senderId: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!team) return null;

  return {
    id: team.id,
    name: team.name,
    avatar: team.avatar ?? undefined,
    memberCount: team.members.length,
    members: team.members.map((member) => ({
      id: member.id,
      userId: member.userId,
      name: member.user.name ?? member.user.email,
      role:
        member.userId === team.creatorId
          ? "Owner"
          : member.role === "ADMIN"
            ? "Admin"
            : "Member",
      status: "offline",
      avatar: member.user.image ?? undefined,
    })),
    channels: team.channels.map((channel) => mapChannel(channel, userId)),
  };
}

export async function getTeamChannels(
  teamId: string,
  userId: string,
): Promise<TeamChannel[]> {
  try {
    const channels = await prisma.channel.findMany({
      where: { teamId },
      orderBy: { createdAt: "asc" },
      include: {
        channelReads: {
          where: { userId },
          take: 1,
        },
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            senderId: true,
            createdAt: true,
          },
        },
      },
    });

    return channels.map((channel) => mapChannel(channel, userId));
  } catch (error) {
    console.error("Error fetching team channels:", error);
    return [];
  }
}

export async function markChannelAsRead(
  channelId: string,
  userId: string,
): Promise<void> {
  try {
    const now = new Date();
    await prisma.channelRead.upsert({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
      update: {
        lastReadAt: now,
      },
      create: {
        channelId,
        userId,
        lastReadAt: now,
      },
    });
  } catch (error) {
    console.error("[Team Service] Error marking channel as read:", error);
  }
}

export type ChannelDetail = {
  id: string;
  name: string;
  icon: string;
  image?: string | null;
  teamId: string;
  teamName: string;
  isAdmin: boolean;
  members: {
    id: string;
    name: string;
    username?: string;
    image?: string;
  }[];
};

export async function getChannel(
  channelId: string,
  teamId: string,
  userId: string,
): Promise<ChannelDetail | null> {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              image: true,
            },
          },
        },
      },
      channels: {
        where: { id: channelId },
        take: 1,
      },
    },
  });

  if (!team) return null;

  const channel = team.channels[0];
  if (!channel) return null;

  const currentMember = team.members.find((m) => m.userId === userId);
  const isAdmin = team.creatorId === userId || currentMember?.role === "ADMIN";

  return {
    id: channel.id,
    name: channel.name,
    icon: channel.icon,
    image: channel.image ?? null,
    teamId: team.id,
    teamName: team.name,
    isAdmin,
    members: team.members.map((member) => ({
      id: member.user.id,
      name: member.user.name ?? member.user.email,
      username: member.user.username ?? undefined,
      image: member.user.image ?? undefined,
    })),
  };
}

export type TeamInfoMember = {
  id: string;
  userId: string;
  name: string;
  username?: string;
  role: string;
  image?: string;
  lastSeenAt: string | null;
};

export type TeamInfoTask = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export type TeamInfo = {
  id: string;
  name: string;
  avatar?: string;
  createdAt: string;
  memberCount: number;
  isAdmin: boolean;
  members: TeamInfoMember[];
  tasks: TeamInfoTask[];
};

export async function getTeamInfo(
  teamId: string,
  userId: string,
): Promise<TeamInfo | null> {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              image: true,
              lastSeenAt: true,
            },
          },
        },
      },
      tasks: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!team) return null;

  const currentMember = team.members.find((m) => m.userId === userId);
  const isAdmin = team.creatorId === userId || currentMember?.role === "ADMIN";

  return {
    id: team.id,
    name: team.name,
    avatar: team.avatar ?? undefined,
    createdAt: team.createdAt.toISOString(),
    memberCount: team.members.length,
    isAdmin,
    members: team.members.map((member) => ({
      id: member.id,
      userId: member.userId,
      name: member.user.name ?? member.user.email,
      username: member.user.username ?? undefined,
      role:
        member.userId === team.creatorId
          ? "Owner"
          : member.role === "ADMIN"
            ? "Admin"
            : "Member",
      image: member.user.image ?? undefined,
      lastSeenAt: member.user.lastSeenAt?.toISOString() ?? null,
    })),
    tasks: team.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      completed: task.completed,
      createdAt: task.createdAt.toISOString(),
    })),
  };
}