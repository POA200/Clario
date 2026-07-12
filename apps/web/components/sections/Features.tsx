import { Container } from "@/components/shared/Container";

import { FeaturesHeader } from "@/components/sections/FeaturesHeader";
import { FeaturesGrid } from "@/components/sections/FeaturesGrid";

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <Container>
        <div className="space-y-12 lg:space-y-16">
          <FeaturesHeader />
          <FeaturesGrid />
        </div>
      </Container>
    </section>
  );
}
