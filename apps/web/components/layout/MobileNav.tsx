"use client";

import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";

import { navigation } from "@/lib/navigation";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger
        className="inline-flex size-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-base font-semibold text-primary">
            Clario
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-1 flex-col gap-1 px-6">
          {navigation.map((item) => (
            <SheetClose
              key={item.name}
              render={
                <Link
                  href={item.href}
                  className="rounded-md px-2 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                />
              }
            >
              {item.name}
            </SheetClose>
          ))}
        </nav>

        <SheetFooter className="p-6 pt-4">
          <SheetClose
            render={
              <Button
                className="w-full justify-between rounded-lg px-5"
                size="lg"
              />
            }
          >
            Get Clario
            <ArrowUpRight className="size-4" />
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
