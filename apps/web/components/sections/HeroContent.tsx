import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { clarioAppUrl } from "@/lib/navigation";

export function HeroContent() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="space-y-6">
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
          The smarter way for{" "}
          <span className="text-primary">teams to chat, collaborate</span> and
          stay organized.
        </h1>

        <p className="max-w-xl text-md leading-6 text-muted-foreground sm:text-xl">
          Clario is a modern team messaging platform that combines real-time
          conversations, announcements, and task management in one intuitive
          workspace.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          size="lg"
          className="w-full sm:w-auto rounded-lg p-6 cursor-pointer"
          render={<a href={clarioAppUrl} />}
        >
          <DownloadIcon className="mr-2 h-4 w-4" />
          Use Clario
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="w-full sm:w-auto rounded-lg p-6 cursor-pointer"
          render={<a href="#features" />}
        >
          Learn More
        </Button>
      </div>
    </div>
  );
}
