import Link from "next/link";
import Image from "next/image";

interface ClarioLogoProps {
  href?: string;
  inverse?: boolean;
  className?: string;
}

export function ClarioLogo({
  href,
  inverse = false,
  className,
}: ClarioLogoProps) {
  const content = (
    <span className={className}>
      <Image
        src="/clario_logo.svg"
        alt="Clario"
        width={178}
        height={58}
        priority
        className={`clario-logo-image ${inverse ? "clario-logo-image-inverse" : ""}`}
      />
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
