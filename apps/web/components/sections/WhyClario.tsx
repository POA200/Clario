import { Container } from "@/components/shared/Container";

import { WhyClarioHeader } from "@/components/sections/WhyClarioHeader";
import { WhyClarioGrid } from "@/components/sections/WhyClarioGrid";

export function WhyClario() {
  return (
    <section className="py-20 lg:py-28">
      <Container>
        <div className="space-y-10 lg:space-y-14">
          <WhyClarioHeader />
          <WhyClarioGrid />
        </div>
      </Container>
    </section>
  );
}
