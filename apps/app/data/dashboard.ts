export type Team = {
  name: string;
  slug: string;
  tone: "bg-primary/15" | "bg-secondary/30";
};

export const DASHBOARD_TEAMS: Team[] = [
  { name: "Alpha Team", slug: "alpha-team", tone: "bg-primary/15" },
  { name: "Project Team", slug: "project-team", tone: "bg-secondary/30" },
];