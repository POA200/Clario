import Link from "next/link";
import { redirect } from "next/navigation";

import { ClarioLogo } from "@/components/common/ClarioLogo";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (user?.id) {
    redirect("/dashboard");
  }
  return (
    <main className="min-h-dvh bg-background p-4">
      <div className="relative flex min-h-[calc(100dvh-2rem)] items-center justify-center rounded-[24px] bg-primary">
        <ClarioLogo inverse />
        <Link
          href="/login"
          className={cn(
            buttonVariants({ size: "lg" }),
            "absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-white px-10 text-primary shadow-lg hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white dark:bg-white dark:text-primary dark:hover:bg-white/90",
          )}
        >
          Continue to Clario
          <ArrowRight className="ml-2 h-4 w-4 text-primary" />
        </Link>
      </div>
    </main>
  );
}
