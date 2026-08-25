import type { ReactNode } from "react";

import { ClarioLogo } from "@/components/common/ClarioLogo";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="min-h-dvh md:grid md:grid-cols-2">
      <div className="hidden bg-primary md:flex md:items-center md:justify-center">
        <ClarioLogo href="/" inverse />
      </div>

      <div className="flex min-h-dvh items-center px-4 py-10 md:px-10 md:py-16 lg:px-14">
        <div className="mx-auto w-full max-w-[520px]">
          <div className="mb-6 text-center md:mb-10">
            <div className="flex justify-center md:hidden">
              <ClarioLogo href="/" />
            </div>
            <h1 className="mt-8 text-left text-2xl font-normal md:mt-0 md:text-3xl">
              {title}
            </h1>
            <p className="sr-only">{description}</p>
          </div>

          {children}

          {footer && (
            <div className="mt-7 text-center text-base text-foreground md:mt-10 md:text-xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
