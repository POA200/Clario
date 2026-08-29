import { MOCK_TEAMS, TEAM_STORAGE_KEY } from "@/data/teams";

export function getLastOpenedTeamId(): string | null {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(TEAM_STORAGE_KEY);
}

export function rememberTeam(teamId: string): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(TEAM_STORAGE_KEY, teamId);
}

export function getDefaultTeamId(): string | null {
  return MOCK_TEAMS[0]?.id ?? null;
}

export function getTeamNavigationId(): string | null {
  const lastOpenedTeamId = getLastOpenedTeamId();

  return MOCK_TEAMS.some((team) => team.id === lastOpenedTeamId)
    ? lastOpenedTeamId
    : getDefaultTeamId();
}