import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTeamInfo } from "@/services/team-service";
import { TeamInfoScreen } from "@/components/team/TeamInfoScreen";

type TeamTasksPageProps = {
  params: Promise<{ teamId: string }>;
};

export default async function TeamTasksPage({ params }: TeamTasksPageProps) {
  const { teamId } = await params;
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  const teamInfo = await getTeamInfo(teamId, user.id);

  if (!teamInfo) {
    notFound();
  }

  return <TeamInfoScreen teamInfo={teamInfo} currentUserId={user.id} />;
}
