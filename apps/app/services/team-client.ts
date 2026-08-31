const TEAM_STORAGE_KEY = "clario:last-opened-team";

export function getLastOpenedTeamId(): string | null {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(TEAM_STORAGE_KEY);
}

export function rememberTeam(teamId: string): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(TEAM_STORAGE_KEY, teamId);
}

export function getTeamNavigationId(): string | null {
  return getLastOpenedTeamId();
}