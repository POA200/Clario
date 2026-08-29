import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { token } = await params;

    const invite = await prisma.teamInvite.findUnique({
      where: {
        token,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "This invite link is invalid or no longer available." },
        { status: 404 },
      );
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invite link has expired." },
        { status: 410 },
      );
    }

    const existingMembership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId: invite.teamId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json({
        joined: false,
        alreadyMember: true,
        team: invite.team,
      });
    }

    await prisma.teamMember.create({
      data: {
        userId: session.user.id,
        teamId: invite.teamId,
        role: "MEMBER",
      },
    });

    return NextResponse.json({
      joined: true,
      alreadyMember: false,
      team: invite.team,
    });
  } catch (error) {
    console.error("Join team error:", error);

    return NextResponse.json(
      { error: "Unable to join team" },
      { status: 500 },
    );
  }
}