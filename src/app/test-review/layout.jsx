import { ROBOTS_NOINDEX } from "@/lib/seoRobots";

export const metadata = {
  title: "Test Review | AllExamQuestions",
  robots: ROBOTS_NOINDEX,
};

export default function TestReviewLayout({ children }) {
  return children;
}
