import "server-only";

import { prisma } from "@/lib/prisma";

export type TaskItem = {
  id: string;
  title: string;
  completed: boolean;
  teamId: string;
  createdAt: string;
};

export type TeamTaskGroup = {
  teamId: string;
  teamName: string;
  channelName: string;
  tasks: TaskItem[];
};

export async function getUserTaskGroups(userId: string): Promise<TeamTaskGroup[]> {
  try {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        channels: {
          orderBy: { createdAt: "asc" },
          take: 1,
        },
        tasks: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return teams.map((team) => ({
      teamId: team.id,
      teamName: team.name,
      channelName: team.channels[0]?.name || "general",
      tasks: team.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        completed: t.completed,
        teamId: t.teamId,
        createdAt: t.createdAt.toISOString(),
      })),
    }));
  } catch (error) {
    console.error("[Task Service] Error fetching user tasks:", error);
    return [];
  }
}

