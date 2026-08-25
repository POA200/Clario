export const navigation = [
  { name: "Features", href: "#features" },
  { name: "How it Works", href: "#how-it-works" },
  { name: "Screens", href: "#screens" },
  { name: "FAQs", href: "#faqs" },
];

export const clarioAppUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3002"
    : "https://clario-mobile.vercel.app";