"use client";

import {
Check,
MoreHorizontal,
ShieldCheck,
UserRound,
} from "lucide-react";
import { useState } from "react";

type Member = {
id: string;
userId: string;
name: string;
email: string;
avatar: string | null;
role: "OWNER" | "ADMIN" | "MEMBER";
};

type MembersListProps = {
teamId: string;
members: Member[];
currentUserId: string;
isAdmin: boolean;
};

export function MembersList({
teamId,
members: initialMembers,
currentUserId,
isAdmin,
}: MembersListProps) {
const [members, setMembers] = useState(initialMembers);
const [openMenu, setOpenMenu] = useState<string | null>(null);
const [loadingId, setLoadingId] = useState<string | null>(null);
const [error, setError] = useState("");

async function updateMember(
member: Member,
action: "promote" | "demote" | "remove",
) {
setLoadingId(member.id);
setError("");
setOpenMenu(null);


try {
  const response = await fetch(
    `/api/teams/${teamId}/members/${member.userId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    setError(
      typeof data?.error === "string"
        ? data.error
        : "Unable to update member.",
    );
    return;
  }

  if (action === "remove") {
    setMembers((current) =>
      current.filter(
        (item) => item.userId !== member.userId,
      ),
    );
  }

  if (action === "promote") {
    setMembers((current) =>
      current.map((item) =>
        item.userId === member.userId
          ? { ...item, role: "ADMIN" }
          : item,
      ),
    );
  }

  if (action === "demote") {
    setMembers((current) =>
      current.map((item) =>
        item.userId === member.userId
          ? { ...item, role: "MEMBER" }
          : item,
      ),
    );
  }
} catch (err) {
  console.error("Update member error:", err);
  setError("Something went wrong. Please try again.");
} finally {
  setLoadingId(null);
}


}

return ( <div className="space-y-3">
{error && ( <div
       role="alert"
       className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
     >
{error} </div>
)}

```
  {members.map((member) => {
    const isCurrentUser = member.userId === currentUserId;
    const isOwner = member.role === "OWNER";
    const isAdminMember = member.role === "ADMIN";
    const isLoading = loadingId === member.id;

    // Owners and admins can manage members except themselves
    // and the owner cannot be managed.
    const canManage =
      isAdmin &&
      !isOwner &&
      !isCurrentUser;

    return (
      <div
        key={member.id}
        className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-4"
      >
        {member.avatar ? (
          <img
            src={member.avatar}
            alt=""
            className="size-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
            <UserRound className="size-5 text-muted-foreground" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate font-medium text-foreground">
              {member.name}
            </p>

            {isCurrentUser && (
              <span className="shrink-0 text-xs text-muted-foreground">
                You
              </span>
            )}
          </div>

          <p className="truncate text-sm text-muted-foreground">
            {member.email}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isOwner ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <ShieldCheck className="size-3.5" />
              Owner
            </span>
          ) : isAdminMember ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <Check className="size-3.5" />
              Admin
            </span>
          ) : (
            <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
              Member
            </span>
          )}

          {canManage && (
            <div className="relative">
              <button
                type="button"
                aria-label={`Manage ${member.name}`}
                onClick={() =>
                  setOpenMenu(
                    openMenu === member.id
                      ? null
                      : member.id,
                  )
                }
                disabled={isLoading}
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <MoreHorizontal className="size-5" />
              </button>

              {openMenu === member.id && (
                <div className="absolute right-0 top-11 z-20 w-52 overflow-hidden rounded-xl border border-border bg-background p-1 shadow-xl">
                  {isAdminMember ? (
                    <button
                      type="button"
                      onClick={() =>
                        updateMember(member, "demote")
                      }
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      Demote from admin
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        updateMember(member, "promote")
                      }
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      Promote to admin
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      updateMember(member, "remove")
                    }
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    Remove from team
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  })}

  {members.length === 0 && (
    <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
      No members found.
    </div>
  )}
</div>


);
}
