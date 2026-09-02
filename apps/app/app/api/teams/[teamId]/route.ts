import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    teamId: string;
  }>;
};

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const membership = team.members[0];
    const isAdmin = team.creatorId === session.user.id || membership?.role === "ADMIN";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only team admins can delete this team" },
        { status: 403 },
      );
    }

    await prisma.team.delete({
      where: { id: teamId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;
    const body = await request.json().catch(() => ({}));

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const membership = team.members[0];
    const isAdmin = team.creatorId === session.user.id || membership?.role === "ADMIN";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only team admins can update team profile" },
        { status: 403 },
      );
    }

    const dataToUpdate: { name?: string; avatar?: string | null } = {};

    if (typeof body.name === "string" && body.name.trim()) {
      dataToUpdate.name = body.name.trim();
    }

    if (body.avatar !== undefined) {
      if (body.avatar === null || body.avatar === "") {
        dataToUpdate.avatar = null;
      } else if (typeof body.avatar === "string") {
        // Validate image size <= 100KB (102,400 bytes)
        const base64Data = body.avatar.includes(",")
          ? body.avatar.split(",")[1]
          : body.avatar;
        const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
        const MAX_BYTES = 100 * 1024; // 100KB

        if (sizeInBytes > MAX_BYTES) {
          return NextResponse.json(
            { error: "Team image must be 100KB or smaller." },
            { status: 400 },
          );
        }

        dataToUpdate.avatar = body.avatar;
      }
    }

    const updated = await prisma.team.update({
      where: { id: teamId },
      data: dataToUpdate,
    });

    return NextResponse.json({
      team: {
        id: updated.id,
        name: updated.name,
        avatar: updated.avatar,
      },
    });
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

