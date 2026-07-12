import { Container } from "@/components/shared/Container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    value: "availability",
    question: "Is Clario available on Android and iOS?",
    answer: "Yes. Built with React Native for cross-platform compatibility.",
  },
  {
    value: "teams",
    question: "Can I create multiple teams?",
    answer: "Yes.",
  },
  {
    value: "realtime",
    question: "Does Clario support real-time messaging?",
    answer: "Absolutely.",
  },
  {
    value: "separation",
    question: "Can announcements and tasks be separated from normal chats?",
    answer:
      "Yes. Clario organizes communication by message type to reduce clutter.",
  },
];

export function FAQs() {
  return (
    <section id="faq" className="py-20 lg:py-28">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="max-w-xl text-center lg:text-left">
            <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
              FAQs
            </p>

            <h2 className="mx-auto mt-4 max-w-md text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl lg:mx-0 lg:text-6xl">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion defaultValue={["availability"]} className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem key={faq.value} value={faq.value}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}
