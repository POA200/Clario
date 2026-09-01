import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserTaskGroups } from "@/services/task-service";
import { TasksScreen } from "@/components/tasks/TasksScreen";

export default async function TasksPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  const groups = await getUserTaskGroups(user.id);

  return <TasksScreen initialGroups={groups} />;
}
