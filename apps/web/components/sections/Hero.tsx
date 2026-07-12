import { Container } from "@/components/shared/Container";

import { HeroContent } from "@/components/sections/HeroContent";
import { HeroVisual } from "@/components/sections/HeroVisual";

export function Hero() {
  return (
    <section className="py-20 lg:py-28">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <HeroContent />
          <HeroVisual />
        </div>
      </Container>
    </section>
  );
}
