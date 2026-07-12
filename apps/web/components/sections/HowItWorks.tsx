import { Container } from "@/components/shared/Container";

import { HowItWorksHeader } from "@/components/sections/HowItWorksHeader";
import { HowItWorksGrid } from "@/components/sections/HowItWorksGrid";

export function HowItWorks() {
  return (
    <section id="screens" className="py-20 lg:py-28">
      <Container>
        <div className="space-y-12 lg:space-y-16">
          <HowItWorksHeader />
          <HowItWorksGrid />
        </div>
      </Container>
    </section>
  );
}
