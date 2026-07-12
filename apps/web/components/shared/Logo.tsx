import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  href?: string;
}

export function Logo({ href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center transition-opacity hover:opacity-80"
    >
      <Image
        src="/logos/clario-logo.svg"
        alt="Clario"
        width={140}
        height={40}
        priority
        className="h-12 w-auto"
      />
    </Link>
  );
}
