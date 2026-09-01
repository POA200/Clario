import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import {
  getUserSettings,
  updateUserSettings,
} from "@/services/settings-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getUserSettings(session.user.id);
    if (!settings) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = await updateUserSettings(session.user.id, {
      receiveTaskUpdates: body.receiveTaskUpdates,
      receiveAnnouncements: body.receiveAnnouncements,
      emailNotifications: body.emailNotifications,
      theme: body.theme,
      accentColor: body.accentColor,
      twoFactorEnabled: body.twoFactorEnabled,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ preferences: result.preferences });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

