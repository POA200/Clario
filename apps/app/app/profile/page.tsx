import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserProfile } from "@/services/user-service";
import { ProfileScreen } from "@/components/profile/ProfileScreen";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  const profile = await getUserProfile(user.id);

  if (!profile) {
    redirect("/login");
  }

  return <ProfileScreen initialProfile={profile} />;
}
