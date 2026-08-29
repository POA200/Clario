import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
params: Promise<{
teamId: string;
userId: string;
}>;
};

export async function PATCH(
request: Request,
{ params }: RouteContext,
) {
try {
const session = await getServerSession(authOptions);


if (!session?.user?.id) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 },
  );
}

const { teamId, userId } = await params;

const currentMembership = await prisma.teamMember.findUnique({
  where: {
    userId_teamId: {
      userId: session.user.id,
      teamId,
    },
  },
});

if (!currentMembership) {
  return NextResponse.json(
    { error: "You are not a member of this team" },
    { status: 403 },
  );
}

const team = await prisma.team.findUnique({
  where: {
    id: teamId,
  },
  select: {
    creatorId: true,
  },
});

if (!team) {
  return NextResponse.json(
    { error: "Team not found" },
    { status: 404 },
  );
}

const isOwner = session.user.id === team.creatorId;
const isAdmin = currentMembership.role === "ADMIN";

if (!isOwner && !isAdmin) {
  return NextResponse.json(
    { error: "Only team admins can manage members" },
    { status: 403 },
  );
}

if (userId === session.user.id) {
  return NextResponse.json(
    { error: "You cannot manage your own membership" },
    { status: 400 },
  );
}

const targetMembership = await prisma.teamMember.findUnique({
  where: {
    userId_teamId: {
      userId,
      teamId,
    },
  },
});

if (!targetMembership) {
  return NextResponse.json(
    { error: "Member not found" },
    { status: 404 },
  );
}

// The owner cannot be promoted, demoted, or removed.
if (userId === team.creatorId) {
  return NextResponse.json(
    { error: "The team owner cannot be managed" },
    { status: 400 },
  );
}

const body = await request.json();
const action = body?.action;

// Promote a regular member to admin.
if (action === "promote") {
  if (targetMembership.role === "ADMIN") {
    return NextResponse.json(
      { error: "Member is already an admin" },
      { status: 400 },
    );
  }

  const member = await prisma.teamMember.update({
    where: {
      id: targetMembership.id,
    },
    data: {
      role: "ADMIN",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return NextResponse.json({
    member: {
      id: member.id,
      userId: member.user.id,
      name: member.user.name ?? member.user.email,
      email: member.user.email,
      avatar: member.user.image,
      role: member.role,
    },
  });
}

// Only the owner can demote an admin.
if (action === "demote") {
  if (!isOwner) {
    return NextResponse.json(
      { error: "Only the team owner can demote an admin" },
      { status: 403 },
    );
  }

  if (targetMembership.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Member is not an admin" },
      { status: 400 },
    );
  }

  const member = await prisma.teamMember.update({
    where: {
      id: targetMembership.id,
    },
    data: {
      role: "MEMBER",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return NextResponse.json({
    member: {
      id: member.id,
      userId: member.user.id,
      name: member.user.name ?? member.user.email,
      email: member.user.email,
      avatar: member.user.image,
      role: member.role,
    },
  });
}

// Remove a member from the team.
if (action === "remove") {
  // Only the owner can remove another admin.
  if (targetMembership.role === "ADMIN" && !isOwner) {
    return NextResponse.json(
      { error: "Only the team owner can remove an admin" },
      { status: 403 },
    );
  }

  await prisma.teamMember.delete({
    where: {
      id: targetMembership.id,
    },
  });

  return NextResponse.json({
    success: true,
    userId,
  });
}

return NextResponse.json(
  { error: "Invalid action" },
  { status: 400 },
);


} catch (error) {
console.error("Manage team member error:", error);


return NextResponse.json(
  { error: "Unable to update team member" },
  { status: 500 },
);


}
}
