import "server-only";

import { prisma } from "@/lib/prisma";

export type NotificationItem = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export async function getUserNotifications(userId: string): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    };
  } catch (error) {
    console.error("[Notification Service] Error fetching notifications:", error);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  try {
    return await prisma.notification.count({
      where: { userId, read: false },
    });
  } catch (error) {
    console.error(
      "[Notification Service] Error counting unread notifications:",
      error,
    );
    return 0;
  }
}

export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string | null;
}) {
  try {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type ?? "INFO",
        link: data.link ?? null,
      },
    });
  } catch (error) {
    console.error("[Notification Service] Error creating notification:", error);
    return null;
  }
}

export async function createTeamNotification(data: {
  teamId: string;
  excludeUserId?: string;
  title: string;
  message: string;
  type?: string;
  link?: string | null;
}) {
  try {
    const members = await prisma.teamMember.findMany({
      where: {
        teamId: data.teamId,
        ...(data.excludeUserId ? { userId: { not: data.excludeUserId } } : {}),
      },
      select: { userId: true },
    });

    if (members.length === 0) return;

    await prisma.notification.createMany({
      data: members.map((m) => ({
        userId: m.userId,
        title: data.title,
        message: data.message,
        type: data.type ?? "INFO",
        link: data.link ?? null,
      })),
    });
  } catch (error) {
    console.error(
      "[Notification Service] Error creating team notifications:",
      error,
    );
  }
}

export async function markNotificationAsRead(
  notificationId: string,
  userId: string,
) {
  return await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      read: true,
    },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });
}

