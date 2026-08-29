import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Users } from "lucide-react";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type InvitePageProps = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  const invite = await prisma.teamInvite.findUnique({
    where: {
      token,
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!invite) {
    return (
      <InviteError message="This invite link is invalid or no longer available." />
    );
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return <InviteError message="This invite link has expired." />;
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    const callbackUrl = `/invite/${token}`;

    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const existingMembership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: session.user.id,
        teamId: invite.teamId,
      },
    },
  });

  if (existingMembership) {
    redirect(`/teams/${invite.teamId}`);
  }

  async function joinTeam() {
    "use server";

    const currentSession = await getServerSession(authOptions);

    if (!currentSession?.user?.id) {
      redirect(`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`);
    }

    const currentInvite = await prisma.teamInvite.findUnique({
      where: {
        token,
      },
      select: {
        teamId: true,
        expiresAt: true,
      },
    });

    if (!currentInvite) {
      redirect(`/invite/${token}?error=invalid`);
    }

    if (currentInvite.expiresAt && currentInvite.expiresAt < new Date()) {
      redirect(`/invite/${token}?error=expired`);
    }

    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: currentSession.user.id,
          teamId: currentInvite.teamId,
        },
      },
    });

    if (!membership) {
      await prisma.teamMember.create({
        data: {
          userId: currentSession.user.id,
          teamId: currentInvite.teamId,
          role: "MEMBER",
        },
      });
    }

    redirect(`/teams/${currentInvite.teamId}`);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-3xl border border-border bg-dashboard-surface p-8 text-center shadow-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Users className="size-8" strokeWidth={1.7} aria-hidden="true" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
          You've been invited
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          You've been invited to join
        </p>

        <p className="mt-1 text-xl font-semibold text-foreground">
          {invite.team.name}
        </p>

        <p className="mt-3 text-sm text-muted-foreground">
          Join the team to start collaborating with its members.
        </p>

        <form action={joinTeam} className="mt-7">
          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-primary"
          >
            Join Team
          </button>
        </form>

        <p className="mt-5 text-xs text-muted-foreground">
          By joining, you'll become a member of this team.
        </p>
      </section>
    </main>
  );
}

function InviteError({ message }: { message: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-3xl border border-border bg-dashboard-surface p-8 text-center shadow-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <Users className="size-8" strokeWidth={1.7} aria-hidden="true" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
          Invite unavailable
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {message}
        </p>
      </section>
    </main>
  );
}
