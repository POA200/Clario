import {
  CheckCheck,
  Hash,
  Layers3,
  Megaphone,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Real-Time Messaging",
    description:
      "Send and receive messages instantly across rooms and direct threads.",
    icon: MessageSquareText,
  },
  {
    title: "Announcements",
    description:
      "Share important updates with the entire team in one clear place.",
    icon: Megaphone,
  },
  {
    title: "Task Management",
    description:
      "Track tasks, owners, and progress without leaving the conversation.",
    icon: CheckCheck,
  },
  {
    title: "Team Workspaces",
    description:
      "Organize projects and groups in dedicated spaces built for focus.",
    icon: Layers3,
  },
  {
    title: "Organized Channels",
    description:
      "Keep discussions structured with focused channels for every topic.",
    icon: Hash,
  },
  {
    title: "Secure Authentication",
    description:
      "Protect access with strong authentication and team-level controls.",
    icon: ShieldCheck,
  },
];

export function FeaturesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <Card
            key={feature.title}
            size="sm"
            className="border-border/4 bg-background/80"
          >
            <CardHeader className="gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
                <Icon className="size-5" />
              </div>

              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold text-foreground">
                  {feature.title}
                </CardTitle>

                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
