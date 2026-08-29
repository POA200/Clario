import { redirect } from "next/navigation";

import { DashboardScreen } from "@/components/dashboard/DashboardScreen";
import { getCurrentUser } from "@/lib/auth";
import { getUserTeams } from "@/services/team-service";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  const teams = await getUserTeams(user.id);

  return <DashboardScreen teams={teams} />;
}
