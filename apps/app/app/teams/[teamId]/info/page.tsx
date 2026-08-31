import { notFound, redirect } from "next/navigation";

import { TeamInfoScreen } from "@/components/team/TeamInfoScreen";
import { getCurrentUser } from "@/lib/auth";
import { getTeamInfo } from "@/services/team-service";

type TeamInfoPageProps = {
  params: Promise<{ teamId: string }>;
};

export default async function TeamInfoPage({ params }: TeamInfoPageProps) {
  const { teamId } = await params;

  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  const teamInfo = await getTeamInfo(teamId, user.id);

  if (!teamInfo) {
    notFound();
  }

  return (
    <TeamInfoScreen
      teamInfo={teamInfo}
      currentUserId={user.id}
    />
  );
}
