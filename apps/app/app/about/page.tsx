import { Metadata } from "next";
import { AboutScreen } from "@/components/about/AboutScreen";

export const metadata: Metadata = {
  title: "About | Clario",
  description:
    "Learn more about Clario, our mission, and our collaboration platform.",
};

export default function AboutPage() {
  return <AboutScreen />;
}
