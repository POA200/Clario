import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPublicUserProfile } from "@/services/user-service";
import { PublicProfileScreen } from "@/components/profile/PublicProfileScreen";

type PublicProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  const profile = await getPublicUserProfile(id);

  if (!profile) {
    notFound();
  }

  return <PublicProfileScreen profile={profile} currentUserId={user.id} />;
}
