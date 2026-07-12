import Link from "next/link";

import { Container } from "@/components/shared/Container";
import { Logo } from "@/components/shared/Logo";

function Footer() {
  return (
    <footer className="bg-background">
      <Container className="py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:gap-8">
          <Logo />

          <nav aria-label="Footer" className="flex flex-col gap-8 lg:items-end">
            <Link
              href="/#features"
              className="text-2xl font-semibold tracking-tight text-foreground transition-colors hover:text-primary sm:text-3xl lg:text-[2.2rem]"
            >
              Features
            </Link>

            <Link
              href="/#screens"
              className="text-2xl font-semibold tracking-tight text-foreground transition-colors hover:text-primary sm:text-3xl lg:text-[2.2rem]"
            >
              Screens
            </Link>

            <Link
              href="/#faq"
              className="text-2xl font-semibold tracking-tight text-foreground transition-colors hover:text-primary sm:text-3xl lg:text-[2.2rem]"
            >
              FAQ
            </Link>
          </nav>

          <p className="text-center text-base text-foreground/90 sm:text-lg lg:text-left">
            © 2026 Clario. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}

export { Footer };
