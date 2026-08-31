import "server-only";

import { prisma } from "@/lib/prisma";
import type { Team, TeamChannel } from "@/types/team";

const VALID_CHANNEL_ICONS = [
  "messages",
  "announcement",
  "design",
  "development",
] as const;

function mapChannel(channel: {
  id: string;
  name: string;
  icon: string;
}): TeamChannel {
  const icon = VALID_CHANNEL_ICONS.includes(
    channel.icon as (typeof VALID_CHANNEL_ICONS)[number],
  )
    ? (channel.icon as TeamChannel["icon"])
    : "messages";

  return {
    id: channel.id,
    name: channel.name,
    icon,
    unread: false,
  };
}

export async function getUserTeams(userId: string): Promise<Team[]> {
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
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return teams.map((team) => ({
    id: team.id,
    name: team.name,
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
    channels: team.channels.map(mapChannel),
  }));
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
      },
    },
  });

  if (!team) return null;

  return {
    id: team.id,
    name: team.name,
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
    channels: team.channels.map(mapChannel),
  };
}

export type ChannelDetail = {
  id: string;
  name: string;
  icon: string;
  teamId: string;
  teamName: string;
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

  return {
    id: channel.id,
    name: channel.name,
    icon: channel.icon,
    teamId: team.id,
    teamName: team.name,
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
  createdAt: string;
  memberCount: number;
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

  return {
    id: team.id,
    name: team.name,
    createdAt: team.createdAt.toISOString(),
    memberCount: team.members.length,
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