import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getRecentTeammates, getUserDMList } from "@/services/dm-service";
import { ChatsListScreen } from "@/components/dm/ChatsListScreen";

export default async function ChatsPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  const [conversations, teammates] = await Promise.all([
    getUserDMList(user.id),
    getRecentTeammates(user.id),
  ]);

  return (
    <ChatsListScreen
      conversations={conversations}
      teammates={teammates}
      currentUserId={user.id}
    />
  );
}
