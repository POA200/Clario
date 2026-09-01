import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ teamId: string; taskId: string }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, taskId } = await params;

    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    if (typeof body.completed !== "boolean") {
      return NextResponse.json({ error: "Invalid completion state" }, { status: 400 });
    }

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, teamId },
    });

    let task;
    if (existingTask) {
      task = await prisma.task.update({
        where: { id: taskId },
        data: { completed: body.completed },
      });
    } else {
      // Check if taskId belongs to a message in the channel/team
      const message = await prisma.message.findFirst({
        where: { id: taskId },
      });

      task = await prisma.task.create({
        data: {
          id: taskId,
          title: message?.content || body.title || "Task",
          completed: body.completed,
          teamId,
        },
      });
    }

    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        completed: task.completed,
        createdAt: task.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, taskId } = await params;

    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.task.deleteMany({
      where: { id: taskId, teamId },
    });

    await prisma.message.updateMany({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

