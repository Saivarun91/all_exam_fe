import { ROBOTS_NOINDEX } from "@/lib/seoRobots";

export const metadata = {
  title: "Test Player | AllExamQuestions",
  robots: ROBOTS_NOINDEX,
};

export default function TestPlayerLayout({ children }) {
  return children;
}
