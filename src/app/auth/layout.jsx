import { ROBOTS_NOINDEX } from "@/lib/seoRobots";

export const metadata = {
  title: "Sign In | AllExamQuestions",
  robots: ROBOTS_NOINDEX,
};

export default function AuthLayout({ children }) {
  return children;
}
