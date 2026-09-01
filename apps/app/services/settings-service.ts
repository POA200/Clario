import "server-only";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type UserSettings = {
  user: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
    image: string | null;
  };
  preferences: {
    receiveTaskUpdates: boolean;
    receiveAnnouncements: boolean;
    emailNotifications: boolean;
    theme: string;
    accentColor: string;
    twoFactorEnabled: boolean;
  };
};

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { preference: true },
    });

    if (!user) return null;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        image: user.image,
      },
      preferences: {
        receiveTaskUpdates: user.preference?.receiveTaskUpdates ?? true,
        receiveAnnouncements: user.preference?.receiveAnnouncements ?? true,
        emailNotifications: user.preference?.emailNotifications ?? false,
        theme: user.preference?.theme ?? "light",
        accentColor: user.preference?.accentColor ?? "#2F1AC4",
        twoFactorEnabled: user.preference?.twoFactorEnabled ?? false,
      },
    };
  } catch (error) {
    console.error("[Settings Service] Error fetching settings:", error);
    return null;
  }
}

export async function updateUserSettings(
  userId: string,
  data: Partial<UserSettings["preferences"]>,
): Promise<{ success: boolean; error?: string; preferences?: UserSettings["preferences"] }> {
  try {
    const updated = await prisma.userPreference.upsert({
      where: { userId },
      create: {
        userId,
        receiveTaskUpdates: data.receiveTaskUpdates ?? true,
        receiveAnnouncements: data.receiveAnnouncements ?? true,
        emailNotifications: data.emailNotifications ?? false,
        theme: data.theme ?? "light",
        accentColor: data.accentColor ?? "#2F1AC4",
        twoFactorEnabled: data.twoFactorEnabled ?? false,
      },
      update: {
        ...(typeof data.receiveTaskUpdates === "boolean" && {
          receiveTaskUpdates: data.receiveTaskUpdates,
        }),
        ...(typeof data.receiveAnnouncements === "boolean" && {
          receiveAnnouncements: data.receiveAnnouncements,
        }),
        ...(typeof data.emailNotifications === "boolean" && {
          emailNotifications: data.emailNotifications,
        }),
        ...(data.theme && { theme: data.theme }),
        ...(data.accentColor && { accentColor: data.accentColor }),
        ...(typeof data.twoFactorEnabled === "boolean" && {
          twoFactorEnabled: data.twoFactorEnabled,
        }),
      },
    });

    return {
      success: true,
      preferences: {
        receiveTaskUpdates: updated.receiveTaskUpdates,
        receiveAnnouncements: updated.receiveAnnouncements,
        emailNotifications: updated.emailNotifications,
        theme: updated.theme,
        accentColor: updated.accentColor,
        twoFactorEnabled: updated.twoFactorEnabled,
      },
    };
  } catch (error) {
    console.error("[Settings Service] Error updating settings:", error);
    return { success: false, error: "Failed to update settings." };
  }
}

export async function changeUserPassword(
  userId: string,
  currentPass: string,
  newPass: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    if (!user.password) {
      return {
        success: false,
        error: "This account uses OAuth sign in and does not have a password set.",
      };
    }

    const matches = await bcrypt.compare(currentPass, user.password);
    if (!matches) {
      return { success: false, error: "Current password is incorrect." };
    }

    if (newPass.length < 6) {
      return {
        success: false,
        error: "New password must be at least 6 characters.",
      };
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("[Settings Service] Error changing password:", error);
    return { success: false, error: "Failed to change password. Please try again." };
  }
}

