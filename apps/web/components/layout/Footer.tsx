import { Container } from "@/components/shared/Container";
import { Logo } from "@/components/shared/Logo";

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <Container className="flex flex-col gap-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <Logo href={""} />
        <p>Built with Clario.</p>
      </Container>
    </footer>
  );
}

export { Footer };
