import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ teamId: string }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;

    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tasks = await prisma.task.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        completed: t.completed,
        createdAt: t.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;

    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const title = body?.title?.trim() || "";

    if (!title) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    if (title.length > 200) {
      return NextResponse.json({ error: "Task title must be 200 characters or less" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        teamId,
      }
    });

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { name: true },
    });

    // Notify other team members asynchronously
    const members = await prisma.teamMember.findMany({
      where: {
        teamId,
        userId: { not: session.user.id },
      },
      select: { userId: true },
    });

    if (members.length > 0) {
      await prisma.notification.createMany({
        data: members.map((m) => ({
          userId: m.userId,
          title: `New Task in ${team?.name || "Team"}`,
          message: `"${title}" was added.`,
          type: "TASK_CREATED",
          link: `/teams/${teamId}`,
        })),
      }).catch((err) => {
        console.error("Failed to create task notifications:", err);
      });
    }

    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        completed: task.completed,
        createdAt: task.createdAt.toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
