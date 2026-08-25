import Image from "next/image";

import { Container } from "@/components/shared/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const previews = [
  {
    title: "Login",
    src: "/images/login-mockup.svg",
    alt: "Clario login screen mockup",
    width: 220,
    height: 420,
  },
  {
    title: "Home",
    src: "/images/home-mockup.svg",
    alt: "Clario home screen mockup",
    width: 220,
    height: 420,
  },
  {
    title: "Chat",
    src: "/images/chat-mockup.svg",
    alt: "Clario chat screen mockup",
    width: 220,
    height: 420,
  },
  {
    title: "Tasks",
    src: "/images/tasks-mockup.svg",
    alt: "Clario tasks screen mockup",
    width: 220,
    height: 420,
  },
];

export function AppPreview() {
  return (
    <section id="screens" className="py-20 lg:py-28">
      <Container>
        <div className="space-y-10 lg:space-y-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
              App Preview
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl">
              See <span className="text-primary">Clario</span> in action.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Experience a clean, intuitive workspace designed to help teams
              communicate, organize, and collaborate effortlessly.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {previews.map((preview) => (
              <Card key={preview.title} size="sm" className="bg-accent/4">
                <CardHeader className="pb-3 pt-6 text-center">
                  <CardTitle className="text-2xl font-semibold text-foreground">
                    {preview.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex items-center justify-center px-4 pb-8 pt-2 sm:px-5">
                  <Image
                    src={preview.src}
                    alt={preview.alt}
                    width={preview.width}
                    height={preview.height}
                    className="h-auto w-full max-w-[12rem] object-contain sm:max-w-[13rem]"
                    priority
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
