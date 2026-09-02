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
            "absolute bottom-8 left-1/2 -translate-x-1/2 bg-background px-10 text-primary hover:bg-background/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-background",
          )}
        >
          Continue to Clario
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
