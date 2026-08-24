import type { Team } from "@/types/team";

export const TEAM_STORAGE_KEY = "clario:last-opened-team";

export const MOCK_TEAMS: Team[] = [
  {
    id: "project-team",
    name: "Project Team",
    memberCount: 13,
    members: [
      { id: "member-1", userId: "user-1", name: "Alex Morgan", role: "Admin", status: "online" },
      { id: "member-2", userId: "user-2", name: "Taylor Reed", role: "Designer", status: "away" },
    ],
    channels: [
      { id: "channel-general", name: "general", icon: "messages", unread: true },
      { id: "channel-announcements", name: "announcements", icon: "announcement", unread: false },
      { id: "channel-design", name: "design-team", icon: "design", unread: false },
      { id: "channel-development", name: "dev-team", icon: "development", unread: false },
    ],
  },
  {
    id: "alpha-team",
    name: "Alpha Team",
    memberCount: 8,
    members: [],
    channels: [
      { id: "alpha-general", name: "general", icon: "messages", unread: false },
    ],
  },
];