import "server-only";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  image: string | null;
  createdAt: string;
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("[User Service] Error fetching profile:", error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    username?: string;
    password?: string;
    image?: string;
  },
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    const updateData: {
      name?: string;
      username?: string | null;
      password?: string;
      image?: string;
    } = {};

    // Validate name
    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      if (!trimmedName) {
        return { success: false, error: "Full Name is required." };
      }
      if (trimmedName.length > 80) {
        return { success: false, error: "Name must be 80 characters or less." };
      }
      updateData.name = trimmedName;
    }

    // Validate username
    if (data.username !== undefined) {
      let cleanUsername = data.username.trim();
      if (cleanUsername.startsWith("@")) {
        cleanUsername = cleanUsername.substring(1).trim();
      }

      if (cleanUsername) {
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
          return {
            success: false,
            error:
              "Username must be 3-30 characters and contain only letters, numbers, and underscores.",
          };
        }

        // Check uniqueness if changed
        if (cleanUsername.toLowerCase() !== (user.username?.toLowerCase() ?? "")) {
          const existing = await prisma.user.findUnique({
            where: { username: cleanUsername },
          });

          if (existing && existing.id !== userId) {
            return {
              success: false,
              error: "This username is already taken. Please choose another.",
            };
          }
        }

        updateData.username = cleanUsername;
      }
    }

    // Validate password if provided
    if (data.password && data.password.trim().length > 0) {
      const trimmedPassword = data.password.trim();
      if (trimmedPassword.length < 6) {
        return {
          success: false,
          error: "Password must be at least 6 characters.",
        };
      }

      const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
      updateData.password = hashedPassword;
    }

    // Validate image if provided
    if (data.image !== undefined) {
      updateData.image = data.image;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        image: updatedUser.image,
        createdAt: updatedUser.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[User Service] Error updating profile:", error);
    return { success: false, error: "Failed to update profile. Please try again." };
  }
}

