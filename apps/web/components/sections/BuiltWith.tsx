import { Container } from "@/components/shared/Container";

import { BuiltWithVisual } from "@/components/sections/BuiltWithVisual";

export function BuiltWith() {
  return (
    <section className="py-10 lg:py-18 w-full">
      <Container>
        <div className="w-full">
          <BuiltWithVisual />
        </div>
      </Container>
    </section>
  );
}
