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