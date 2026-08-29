import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { teamId } = await params;

    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this team" },
        { status: 403 },
      );
    }

    if (membership.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only team admins can create invites" },
        { status: 403 },
      );
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 },
      );
    }

    const token = randomBytes(24).toString("hex");

    const invite = await prisma.teamInvite.create({
      data: {
        token,
        teamId,
        createdBy: session.user.id,
      },
    });

    const origin = new URL(request.url).origin;
    const inviteUrl = `${origin}/invite/${invite.token}`;

    return NextResponse.json(
      {
        invite: {
          id: invite.id,
          token: invite.token,
          url: inviteUrl,
          team: {
            id: team.id,
            name: team.name,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create team invite error:", error);

    return NextResponse.json(
      { error: "Unable to create team invite" },
      { status: 500 },
    );
  }
}