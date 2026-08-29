import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Users } from "lucide-react";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MembersList } from "@/components/team/MembersList";

type MembersPageProps = {
  params: Promise<{
    teamId: string;
  }>;
};

type MemberRole = "OWNER" | "ADMIN" | "MEMBER";

type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  role: MemberRole;
};

export default async function MembersPage({ params }: MembersPageProps) {
  const { teamId } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!team) {
    redirect("/teams");
  }

  const currentMembership = team.members.find(
    (member) => member.userId === user.id,
  );

  const isAdmin =
    currentMembership?.role === "ADMIN" || team.creatorId === user.id;

  const members: Member[] = team.members.map((member) => ({
    id: member.id,
    userId: member.user.id,
    name: member.user.username
      ? `@${member.user.username}`
      : (member.user.name ?? member.user.email),
    email: member.user.email,
    avatar: member.user.image ?? null,
    role: member.userId === team.creatorId ? "OWNER" : member.role,
  }));

  return (
    <div className="min-h-dvh bg-background">
      <main className="min-h-dvh px-4 py-5 md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href={`/teams/${team.id}`}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to {team.name}
          </Link>

          <header className="mt-8">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
                <Users className="size-5 text-foreground" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Members
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  {team.name} · {members.length}{" "}
                  {members.length === 1 ? "member" : "members"}
                </p>
              </div>
            </div>
          </header>

          {isAdmin && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />

              <div>
                <p className="text-sm font-medium text-foreground">
                  You are an admin
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  You can promote members, demote admins, or remove members from
                  the team.
                </p>
              </div>
            </div>
          )}

          <section className="mt-8">
            <MembersList
              teamId={team.id}
              members={members}
              currentUserId={user.id}
              isAdmin={isAdmin}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
