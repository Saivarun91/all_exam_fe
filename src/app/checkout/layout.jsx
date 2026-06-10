import { ROBOTS_NOINDEX } from "@/lib/seoRobots";

export const metadata = {
  title: "Checkout | AllExamQuestions",
  robots: ROBOTS_NOINDEX,
};

export default function CheckoutLayout({ children }) {
  return children;
}
