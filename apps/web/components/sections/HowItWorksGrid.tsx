import { UserPlus, Users, MessageSquareMore } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Create an Account",
    description: "Sign up securely using your email address.",
    icon: UserPlus,
  },
  {
    number: "02",
    title: "Create or Join a Team",
    description: "Collaborate with classmates, colleagues, or project members.",
    icon: Users,
  },
  {
    number: "03",
    title: "Start Collaborating",
    description:
      "Send messages, share announcements, and manage tasks in real time.",
    icon: MessageSquareMore,
  },
];

export function HowItWorksGrid() {
  return (
    <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
      {steps.map((step) => {
        const Icon = step.icon;

        return (
          <Card
            key={step.number}
            size="sm"
            className="border-0 ring-0 bg-background shadow-none"
          >
            <CardHeader className="flex h-full flex-col items-center justify-center gap-5 px-6 py-8 text-center sm:px-8 sm:py-10">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/10 sm:h-28 sm:w-28">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/2 text-primary sm:h-24 sm:w-24">
                  <div className="flex flex-col items-center gap-1 text-primary">
                    <Icon className="size-6 sm:size-7" />
                    <span className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {step.number}
                    </span>
                  </div>
                </div>
              </div>

              <CardTitle className="text-2xl font-bold leading-tight text-foreground sm:text-[1.75rem]">
                {step.title}
              </CardTitle>

              <CardDescription className="max-w-xs text-base leading-7 text-muted-foreground sm:text-[1.05rem]">
                {step.description}
              </CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
