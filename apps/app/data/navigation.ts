import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Check,
  CheckSquare,
  Home,
  Settings,
  Users,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const homeItem = { label: "Home", href: "/dashboard", icon: Home };
const teamsItem = { label: "Teams", href: "/teams", icon: Users };
const tasksItem = { label: "Tasks", href: "/tasks", icon: CheckSquare };

export const DASHBOARD_NAVIGATION: NavigationItem[] = [
  homeItem,
  teamsItem,
  { label: "Tasks", href: "/tasks", icon: Check },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
];

export const MOBILE_NAVIGATION: NavigationItem[] = [
  homeItem,
  teamsItem,
  tasksItem,
  { label: "Settings", href: "/settings", icon: Settings },
];