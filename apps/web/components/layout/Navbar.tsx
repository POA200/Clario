import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Container } from "@/components/shared/Container";
import { Logo } from "@/components/shared/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { navigation } from "@/lib/navigation";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex">
          <Button size="lg" className="gap-2 px-5 rounded-lg">
            Get Clario
            <ArrowUpRight className="size-4" />
          </Button>
        </div>

        <div className="md:hidden">
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
