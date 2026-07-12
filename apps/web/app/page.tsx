import { Container } from "@/components/shared/Container";

export default function HomePage() {
  return (
    <main>
      <Container className="py-20">
        <h1 className="text-5xl font-bold">Clario</h1>
        <p className="mt-4 text-muted-foreground">
          Team communication built for students.
        </p>
      </Container>
    </main>
  );
}
