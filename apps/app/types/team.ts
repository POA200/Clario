export type TeamMemberStatus = "online" | "away" | "offline";

export type TeamMember = {
  id: string;
  userId: string;
  name: string;
  role: string;
  status: TeamMemberStatus;
  avatar?: string;
};

export type TeamChannel = {
  id: string;
  name: string;
  icon: "messages" | "announcement" | "design" | "development";
  unread: boolean;
};

export type Team = {
  id: string;
  name: string;
  memberCount: number;
  avatar?: string;
  members: TeamMember[];
  channels: TeamChannel[];
};