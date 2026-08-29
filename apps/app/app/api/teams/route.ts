import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

function createSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 },
      );
    }

    if (name.length > 80) {
      return NextResponse.json(
        { error: "Team name must be 80 characters or less" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const baseSlug = createSlug(name);

    if (!baseSlug) {
      return NextResponse.json(
        { error: "Please provide a valid team name" },
        { status: 400 },
      );
    }

    let slug = baseSlug;
    let suffix = 2;

    while (await prisma.team.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const team = await prisma.team.create({
      data: {
        name,
        slug,
        creatorId: user.id,
        members: {
          create: {
            userId: user.id,
          },
        },
      },
    });

    return NextResponse.json(
      {
        team: {
          id: team.id,
          name: team.name,
          slug: team.slug,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create team error:", error);

    return NextResponse.json(
      { error: "Unable to create team" },
      { status: 500 },
    );
  }
}