import { Container } from "@/components/shared/Container";
import { Logo } from "@/components/shared/Logo";

function Navbar() {
  return (
    <header className="border-b border-border/60 bg-background/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Logo href={""} />
      </Container>
    </header>
  );
}

export { Navbar };
