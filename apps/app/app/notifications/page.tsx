import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserNotifications } from "@/services/notification-service";
import { NotificationsScreen } from "@/components/notifications/NotificationsScreen";

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  const { notifications, unreadCount } = await getUserNotifications(user.id);

  return (
    <NotificationsScreen
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
    />
  );
}
