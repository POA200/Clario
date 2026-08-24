import { notFound } from "next/navigation";

import { TeamScreen } from "@/components/team/TeamScreen";
import { getTeam } from "@/services/team-service";

type TeamPageProps = {
  params: Promise<{ teamId: string }>;
};

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const team = await getTeam(teamId);
  if (!team) notFound();
  return <TeamScreen team={team} />;
}
