import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  Shield,
  Eye,
  Database,
  FileCheck,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Clario",
  description:
    "Learn how Clario collects, protects, and manages your personal data and team communications.",
};

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-xs text-muted-foreground">
              Last updated: September 1, 2026
            </p>
          </div>
        </header>

        {/* Introduction Card */}
        <div className="rounded-[28px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-6 space-y-3">
          <div className="flex items-center gap-2 text-base font-bold text-foreground">
            <Shield className="size-5 text-[#2F1AC4] dark:text-primary" />
            <span>Our Privacy Commitment</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            At Clario, your privacy and data security are foundational to
            everything we build. This Privacy Policy details the types of
            information we collect, how it is used to deliver real-time
            collaboration features, and the rigorous standards we maintain to
            keep your data safe.
          </p>
        </div>

        {/* Section 1: Information Collected */}
        <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-6 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-foreground">
            <Database className="size-5 text-[#2F1AC4] dark:text-primary" />
            <span>1. Information We Collect</span>
          </div>

          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground">
                Account Information
              </h3>
              <p>
                When you create an account, we collect your name, email address,
                chosen username, and securely hashed passwords. If you
                authenticate via Google OAuth, we receive your verified profile
                name, email, and avatar image.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground">
                Workspace & Team Content
              </h3>
              <p>
                We store messages, channel discussions, direct communications,
                task assignments, and workspace metadata necessary to provide
                team synchronization across all your active devices.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground">
                Usage & Device Telemetry
              </h3>
              <p>
                We collect technical diagnostics including browser type, IP
                address, session timestamps, and system performance metrics to
                maintain server availability and troubleshoot connectivity
                issues.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: How We Use Data */}
        <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-6 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-foreground">
            <Eye className="size-5 text-[#2F1AC4] dark:text-primary" />
            <span>2. How We Use Your Information</span>
          </div>

          <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>
              To authenticate your identity and safeguard your active sessions.
            </li>
            <li>
              To deliver real-time messaging, notifications, and task updates.
            </li>
            <li>
              To provide personalized preferences such as theme settings and
              alert configurations.
            </li>
            <li>
              To dispatch critical transactional emails, including password
              reset links.
            </li>
            <li>
              To prevent fraud, abuse, unauthorized access, and spam within team
              workspaces.
            </li>
          </ul>
        </div>

        {/* Section 3: Data Protection & Security */}
        <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-6 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-foreground">
            <Lock className="size-5 text-[#2F1AC4] dark:text-primary" />
            <span>3. Data Security & Storage</span>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            All data transmitted between your browser and our servers is
            encrypted using modern Transport Layer Security (TLS 1.3). Passwords
            are hashed using industry-standard bcrypt encryption before storage.
            We utilize cloud infrastructure with continuous monitoring,
            automated backups, and strict role-based access restrictions.
          </p>
        </div>

        {/* Section 4: Third-Party Service Providers */}
        <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-6 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-foreground">
            <FileCheck className="size-5 text-[#2F1AC4] dark:text-primary" />
            <span>4. Third-Party Integrations</span>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            We work with vetted third-party services exclusively to facilitate
            essential app capabilities:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Google Identity</strong>:
              Authentication and account linkage.
            </li>
            <li>
              <strong className="text-foreground">Resend</strong>: Transactional
              notification delivery (e.g. password resets).
            </li>
            <li>
              <strong className="text-foreground">Postgres Database</strong>:
              Encrypted data persistence.
            </li>
          </ul>
          <p className="text-xs text-muted-foreground pt-1">
            We never sell, rent, or monetize your personal data or private
            messages to advertisers.
          </p>
        </div>

        {/* Section 5: Your Rights & Account Deletion */}
        <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-6 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-foreground">
            <HelpCircle className="size-5 text-[#2F1AC4] dark:text-primary" />
            <span>5. Your Rights & Data Control</span>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            You retain full ownership and control over your personal data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Profile Edits</strong>: You
              may update your display name, username, avatar, and password at
              any time via Profile Settings.
            </li>
            <li>
              <strong className="text-foreground">Account Deletion</strong>: You
              can permanently delete your account directly inside Settings →
              Delete Account, which completely purges your credentials, profile
              details, and private data.
            </li>
          </ul>
        </div>

        {/* Contact Footer */}
        <div className="rounded-[24px] border border-border bg-card p-5 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Questions about our Privacy Policy?
          </p>
          <p className="text-xs text-muted-foreground">
            Reach out to our security and privacy team at{" "}
            <span className="font-medium text-primary">privacy@clario.app</span>
            .
          </p>
        </div>

        <div className="text-center pt-2 pb-6">
          <Link
            href="/terms-of-service"
            className="text-xs font-semibold text-primary hover:underline"
          >
            View Terms of Service →
          </Link>
        </div>
      </main>
    </div>
  );
}
