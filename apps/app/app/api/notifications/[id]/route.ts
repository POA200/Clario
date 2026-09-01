import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { markNotificationAsRead } from "@/services/notification-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await markNotificationAsRead(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

