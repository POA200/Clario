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

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, channelId } = await params;

    const [membership, team] = await Promise.all([
      prisma.teamMember.findUnique({
        where: {
          userId_teamId: {
            userId: session.user.id,
            teamId,
          },
        },
      }),
      prisma.team.findUnique({
        where: { id: teamId },
        select: { creatorId: true },
      }),
    ]);

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isAdmin = membership.role === "ADMIN" || team?.creatorId === session.user.id;
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only team admins can delete channels" },
        { status: 403 },
      );
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

    // Check if team has more than 1 channel
    const totalChannels = await prisma.channel.count({
      where: { teamId },
    });

    if (totalChannels <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the only channel in a team" },
        { status: 400 },
      );
    }

    await prisma.channel.delete({
      where: { id: channelId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting channel:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

