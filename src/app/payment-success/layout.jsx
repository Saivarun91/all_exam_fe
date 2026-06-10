import { ROBOTS_NOINDEX } from "@/lib/seoRobots";

export const metadata = {
  title: "Payment Success | AllExamQuestions",
  robots: ROBOTS_NOINDEX,
};

export default function PaymentSuccessLayout({ children }) {
  return children;
}
