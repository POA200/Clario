import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (user?.id) {
    redirect("/dashboard");
  }

  return <OnboardingScreen />;
}
