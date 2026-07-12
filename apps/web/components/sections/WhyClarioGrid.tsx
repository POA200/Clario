import { Bolt, CheckCircle2, Megaphone, MessageSquareText } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const reasons = [
  {
    title: "Organized Communication",
    description:
      "Keep discussions structured with dedicated teams and channels, reducing clutter and making conversations easier to follow.",
    icon: MessageSquareText,
  },
  {
    title: "Important Updates Never Get Lost",
    description:
      "Separate announcements from everyday conversations so important information is always easy to find.",
    icon: Megaphone,
  },
  {
    title: "Turn Conversations Into Action",
    description:
      "Create and manage tasks without switching between multiple apps, helping teams stay productive.",
    icon: CheckCircle2,
  },
  {
    title: "Built for Speed",
    description:
      "Enjoy instant messaging and real-time updates, keeping every team member connected.",
    icon: Bolt,
  },
];

export function WhyClarioGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
      {reasons.map((reason) => {
        const Icon = reason.icon;

        return (
          <Card
            key={reason.title}
            size="sm"
            className="border-border/4 bg-background/90"
          >
            <CardHeader className="gap-4 p-5 sm:p-6">
              <div className="flex flex-col gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
                  <Icon className="size-5" />
                </div>

                <CardTitle className="text-lg font-bold leading-tight text-foreground sm:text-xl">
                  {reason.title}
                </CardTitle>
              </div>

              <CardDescription className="text-sm leading-6 text-muted-foreground sm:text-sm">
                {reason.description}
              </CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
