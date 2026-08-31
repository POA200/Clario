import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { getUserTeams } from "@/services/team-service";

export default async function TeamsPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  const teams = await getUserTeams(user.id);

  if (teams.length === 0) {
    redirect("/dashboard");
  }

  redirect(`/teams/${teams[0].id}`);
}
