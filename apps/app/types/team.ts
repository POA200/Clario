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
  icon: string;
  image?: string | null;
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

export type MessageType = "NORMAL" | "ANNOUNCEMENT" | "TASK";

export type MessageReactionSummary = {
  emoji: string;
  count: number;
  userIds: string[];
};

export type ChannelMessage = {
  id: string;
  content: string;
  type: MessageType;
  deadline?: string;
  completed?: boolean;
  createdAt: string;
  updatedAt?: string;
  reactions?: MessageReactionSummary[];
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
    senderUsername?: string;
  } | null;
  sender: {
    id: string;
    name: string;
    username?: string;
    image?: string;
  };
};