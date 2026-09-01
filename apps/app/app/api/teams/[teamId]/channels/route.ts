import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTeamChannels } from "@/services/team-service";

const VALID_ICONS = [
  "messages",
  "announcement",
  "design",
  "development",
] as const;

function createSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const channels = await getTeamChannels(teamId, session.user.id);

    return NextResponse.json({ channels });
  } catch (error) {
    console.error("Fetch channels error:", error);
    return NextResponse.json(
      { error: "Unable to fetch channels" },
      { status: 500 },
    );
  }
}

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
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const icon =
      typeof body.icon === "string" &&
      VALID_ICONS.includes(body.icon as (typeof VALID_ICONS)[number])
        ? body.icon
        : "messages";

    if (!name) {
      return NextResponse.json(
        { error: "Channel name is required" },
        { status: 400 },
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: "Channel name must be 50 characters or less" },
        { status: 400 },
      );
    }

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

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 },
      );
    }

    const slug = createSlug(name);

    if (!slug) {
      return NextResponse.json(
        { error: "Please provide a valid channel name" },
        { status: 400 },
      );
    }

    const existing = await prisma.channel.findUnique({
      where: {
        teamId_slug: {
          teamId,
          slug,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A channel with that name already exists" },
        { status: 409 },
      );
    }

    const channel = await prisma.channel.create({
      data: {
        name,
        slug,
        icon,
        teamId,
      },
    });

    return NextResponse.json(
      {
        channel: {
          id: channel.id,
          name: channel.name,
          slug: channel.slug,
          icon: channel.icon,
          unread: false,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create channel error:", error);

    return NextResponse.json(
      { error: "Unable to create channel" },
      { status: 500 },
    );
  }
}