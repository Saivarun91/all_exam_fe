import { ROBOTS_NOINDEX } from "@/lib/seoRobots";

export const metadata = {
  title: "Dashboard | AllExamQuestions",
  robots: ROBOTS_NOINDEX,
};

export default function DashboardLayout({ children }) {
  return children;
}
