import Image from "next/image";

type Logo = {
  src: string;
  alt: string;
  className?: string;
};

const logos: Logo[] = [
  {
    src: "/logos/react-native-logo.svg",
    alt: "React Native",
  },
  {
    src: "/logos/supabase-logo.svg",
    alt: "Supabase",
  },
  {
    src: "/logos/postgrsql-logo.svg",
    alt: "PostgreSQL",
  },
  {
    src: "/logos/figma-logo.svg",
    alt: "Figma",
  },
  {
    src: "/logos/expo-logo.svg",
    alt: "Expo",
  },
];

export function BuiltWithVisual() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-5 items-center gap-x-10 gap-y-8 sm:grid-cols-5 sm:gap-x-14 sm:gap-y-10 lg:grid-cols-5 lg:gap-x-16 lg:gap-y-12">
        {logos.map((logo) => (
          <div
            key={logo.alt}
            className={`flex items-center justify-center ${logo.className ?? ""}`.trim()}
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={180}
              height={80}
              className="h-auto w-32 object-contain sm:w-36 lg:w-40"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
