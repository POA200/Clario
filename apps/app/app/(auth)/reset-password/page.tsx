import { Suspense } from "react";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Create New Password"
      description="Choose a new password for your Clario account."
      footer={
        <>
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <Suspense
        fallback={
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
