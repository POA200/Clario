import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/shared/Container";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <Container className="py-20">
          <h1 className="max-w-3xl text-6xl font-bold tracking-tight">
            Team communication built for students.
          </h1>

          <p className="mt-6 max-w-xl text-xl text-muted-foreground">
            Clario helps student teams communicate, collaborate, and manage
            projects in one beautiful workspace.
          </p>
        </Container>
      </main>
    </>
  );
}
