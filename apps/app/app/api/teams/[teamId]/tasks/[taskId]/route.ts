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
    if (typeof body.completed !== 'boolean') {
      return NextResponse.json({ error: "Invalid completion state" }, { status: 400 });
    }

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, teamId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { completed: body.completed },
    });

    return NextResponse.json({
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        completed: updatedTask.completed,
        createdAt: updatedTask.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
