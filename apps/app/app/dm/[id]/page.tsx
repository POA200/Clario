import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getDMConversation,
  getDMConversationByRecipient,
} from "@/services/dm-service";
import { DirectMessageScreen } from "@/components/dm/DirectMessageScreen";

type DMPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DMPage({ params }: DMPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  // First try finding conversation by recipient user ID or username
  let conversation = await getDMConversationByRecipient(user.id, id);

  // If not found by recipient ID, try by direct conversation ID
  if (!conversation) {
    conversation = await getDMConversation(id, user.id);
  }

  if (!conversation) {
    notFound();
  }

  return (
    <DirectMessageScreen
      initialConversation={conversation}
      currentUserId={user.id}
    />
  );
}
