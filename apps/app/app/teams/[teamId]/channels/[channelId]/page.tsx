import { notFound, redirect } from "next/navigation";

import { ChannelScreen } from "@/components/channel/ChannelScreen";
import { getCurrentUser } from "@/lib/auth";
import { getChannel } from "@/services/team-service";

type ChannelPageProps = {
  params: Promise<{ teamId: string; channelId: string }>;
};

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { teamId, channelId } = await params;

  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  const channel = await getChannel(channelId, teamId, user.id);

  if (!channel) {
    notFound();
  }

  return (
    <ChannelScreen
      channel={channel}
      currentUser={{ id: user.id, name: user.name ?? undefined, image: user.image ?? undefined }}
    />
  );
}
