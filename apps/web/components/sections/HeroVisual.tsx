import Image from "next/image";

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[28rem] overflow-hidden rounded-3xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-700 p-6 lg:max-w-none lg:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_45%)]" />
      <div className="relative flex min-h-[34rem] items-center justify-center lg:min-h-[44rem]">
        <Image
          src="/images/clario-hero-image.svg"
          alt="Clario mobile app"
          width={500}
          height={900}
          priority
          className="h-auto w-full max-w-[18rem] drop-shadow-2xl sm:max-w-[20rem] lg:max-w-[22rem]"
        />
      </div>
    </div>
  );
}
