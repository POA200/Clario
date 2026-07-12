import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { BuiltWith } from "@/components/sections/BuiltWith";
import { Features } from "@/components/sections/Features";
import { FAQs } from "@/components/sections/FAQs";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Hero } from "@/components/sections/Hero";
import { WhyClario } from "@/components/sections/WhyClario";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <BuiltWith />
      <Features />
      <WhyClario />
      <HowItWorks />
      <FAQs />
      <FinalCTA />
      <Footer />
    </main>
  );
}
