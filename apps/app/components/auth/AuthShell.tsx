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
    <main className="min-h-dvh px-4 pb-12 pt-36 md:px-7 md:py-[16vh]">
      <div className="mx-auto w-full max-w-[710px]">
        <div className="mb-5 text-center md:mb-20">
          <div className="flex justify-center">
            <ClarioLogo href="/" />
          </div>
          <h1 className="mt-12 text-left text-2xl font-normal md:mt-[300px] md:text-3xl">
            {title}
          </h1>
          <p className="sr-only">{description}</p>
        </div>

        {children}

        {footer && (
          <div className="mt-7 text-center text-base text-foreground md:mt-14 md:text-2xl">
            {footer}
          </div>
        )}
      </div>
    </main>
  );
}
