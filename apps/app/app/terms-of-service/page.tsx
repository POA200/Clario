import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  FileText,
  Gavel,
  KeyRound,
  ShieldAlert,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Clario",
  description:
    "Terms of Service and user agreement governing the use of Clario's communication and task management platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-2xl px-5 py-6 md:py-10 space-y-6">
        {/* Header */}
        <header className="flex items-center gap-3">
          <Link
            href="/about"
            aria-label="Back to About"
            className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ArrowLeft className="size-6" strokeWidth={2.2} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Terms of Service
            </h1>
            <p className="text-xs text-muted-foreground">
              Last updated: September 1, 2026
            </p>
          </div>
        </header>

        {/* Introduction Card */}
        <div className="rounded-[28px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-6 space-y-3">
          <div className="flex items-center gap-2 text-base font-bold text-foreground">
            <BookOpen className="size-5 text-[#2F1AC4] dark:text-primary" />
            <span>Agreement to Terms</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            By accessing or using the Clario platform, applications, or related
            services, you agree to be bound by these Terms of Service and our
            Privacy Policy. If you do not agree with these terms, please do not
            access or use Clario.
          </p>
        </div>

        {/* Section 1: Account Creation & Security */}
        <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-6 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-foreground">
            <KeyRound className="size-5 text-[#2F1AC4] dark:text-primary" />
            <span>1. Account Registration & Security</span>
          </div>

          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              To use Clario, you must create an account by providing accurate,
              current, and complete information. You are solely responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Maintaining the confidentiality of your login credentials and
                password.
              </li>
              <li>
                All activities and interactions that occur under your account.
              </li>
              <li>
                Promptly notifying Clario of any unauthorized access or security
                breach.
              </li>
            </ul>
          </div>
        </div>

        {/* Section 2: Acceptable Use */}
        <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-6 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-foreground">
            <ShieldAlert className="size-5 text-[#2F1AC4] dark:text-primary" />
            <span>2. Acceptable Use Policy</span>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            You agree not to misuse Clario. You must not:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
            <li>
              Engage in illegal activities, transmit malicious code, viruses, or
              spam.
            </li>
            <li>
              Harass, threaten, impersonate, or infringe upon the rights of
              others.
            </li>
            <li>
              Interfere with, disrupt, or reverse engineer the platform
              infrastructure or APIs.
            </li>
            <li>
              Attempt to bypass authentication, security filters, or access
              control boundaries.
            </li>
          </ul>
        </div>

        {/* Section 3: Intellectual Property & Content Ownership */}
        <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-6 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-foreground">
            <CheckCircle className="size-5 text-[#2F1AC4] dark:text-primary" />
            <span>3. User Content & Intellectual Property</span>
          </div>

          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">Your Content</strong>: You
              retain full ownership of all messages, files, and tasks you submit
              to Clario. By posting content, you grant Clario a limited license
              solely to host, transmit, and display your content as necessary to
              operate the service.
            </p>
            <p>
              <strong className="text-foreground">Clario IP</strong>: The Clario
              brand, logos, UI designs, code, and trademarks are the exclusive
              property of Clario Inc. and protected by copyright and
              intellectual property laws.
            </p>
          </div>
        </div>

        {/* Section 4: Termination & Cancellation */}
        <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-6 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-foreground">
            <FileText className="size-5 text-[#2F1AC4] dark:text-primary" />
            <span>4. Termination & Account Deletion</span>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            You may terminate your account at any time using the in-app Delete
            Account option in Settings. Clario reserves the right to suspend or
            terminate accounts that violate these Terms, create legal risk, or
            compromise community safety.
          </p>
        </div>

        {/* Section 5: Limitation of Liability */}
        <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-6 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-foreground">
            <Gavel className="size-5 text-[#2F1AC4] dark:text-primary" />
            <span>5. Limitation of Liability</span>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Clario is provided on an &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; basis without warranties of any kind. To the
            maximum extent permitted by law, Clario Inc. shall not be liable for
            any indirect, incidental, special, consequential, or punitive
            damages arising from your use of the service.
          </p>
        </div>

        {/* Contact Footer */}
        <div className="rounded-[24px] border border-border bg-card p-5 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Need clarification on our Terms?
          </p>
          <p className="text-xs text-muted-foreground">
            Contact our legal department at{" "}
            <span className="font-medium text-primary">legal@clario.app</span>.
          </p>
        </div>

        <div className="text-center pt-2 pb-6">
          <Link
            href="/privacy-policy"
            className="text-xs font-semibold text-primary hover:underline"
          >
            ← View Privacy Policy
          </Link>
        </div>
      </main>
    </div>
  );
}
