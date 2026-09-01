import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { markChannelAsRead } from "@/services/team-service";

type RouteContext = {
  params: Promise<{
    teamId: string;
    channelId: string;
  }>;
};

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

    await markChannelAsRead(channelId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking channel as read:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

