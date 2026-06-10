import { ROBOTS_NOINDEX } from "@/lib/seoRobots";
import AdminLayoutClient from "./AdminLayoutClient";

export const metadata = {
  title: "Admin | AllExamQuestions",
  robots: ROBOTS_NOINDEX,
};

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
