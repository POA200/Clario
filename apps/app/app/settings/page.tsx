import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserSettings } from "@/services/settings-service";
import { SettingsScreen } from "@/components/settings/SettingsScreen";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  const settings = await getUserSettings(user.id);

  if (!settings) {
    redirect("/login");
  }

  return <SettingsScreen initialSettings={settings} />;
}
