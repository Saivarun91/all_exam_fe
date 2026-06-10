import { ROBOTS_NOINDEX } from "@/lib/seoRobots";

export const metadata = {
  title: "Profile | AllExamQuestions",
  robots: ROBOTS_NOINDEX,
};

export default function ProfileLayout({ children }) {
  return children;
}
