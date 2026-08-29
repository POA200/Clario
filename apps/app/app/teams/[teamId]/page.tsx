import { notFound, redirect } from "next/navigation";

import { TeamScreen } from "@/components/team/TeamScreen";
import { getCurrentUser } from "@/lib/auth";
import { getTeam } from "@/services/team-service";

type TeamPageProps = {
  params: Promise<{ teamId: string }>;
};

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;

  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  const team = await getTeam(teamId, user.id);

  if (!team) {
    notFound();
  }

  return <TeamScreen team={team} />;
}
