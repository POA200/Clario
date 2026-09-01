import { ArrowUpRight } from "lucide-react";

import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { clarioAppUrl } from "@/lib/navigation";

export function FinalCTA() {
  return (
    <section className="py-8 lg:py-12">
      <Container>
        <div className="overflow-hidden rounded-[2rem] bg-primary px-6 py-20 text-center sm:px-10 sm:py-24 lg:px-16 lg:py-28">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
              Ready to transform team communication?
            </h2>

            <p className="mx-auto max-w-3xl text-lg leading-8 text-white/85 sm:text-xl">
              Experience organized conversations, streamlined collaboration, and
              productive teamwork, all in one place.
            </p>

            <div className="pt-4 sm:pt-6">
              <Button
                size="lg"
                className="w-full rounded-xl bg-white px-8 py-6 text-lg font-semibold text-foreground shadow-sm hover:bg-white/95 sm:w-auto sm:min-w-56 cursor-pointer"
                render={<a href={clarioAppUrl} />}
              >
                Get Started
                <ArrowUpRight className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
