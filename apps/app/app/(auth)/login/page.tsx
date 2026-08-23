import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Login to your Account"
      description="Sign in to continue to your workspace."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign Up
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
