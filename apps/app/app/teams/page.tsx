import { redirect } from "next/navigation";

import { getDefaultTeamId } from "@/services/team-service";

export default function TeamsPage() {
  const teamId = getDefaultTeamId();
  if (!teamId) redirect("/dashboard");
  redirect(`/teams/${teamId}`);
}
