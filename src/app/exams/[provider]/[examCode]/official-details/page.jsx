import { notFound, redirect } from "next/navigation";
import { getOfficialExamInfoPathFromExam } from "../examInfoUtils";
import { examFetchOptions } from "@/lib/serverRevalidate";

export const revalidate = 300;

async function fetchExam(provider, examCode) {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const res = await fetch(
    `${API_BASE}/api/courses/exams/${provider}-${examCode}/`,
    examFetchOptions()
  );

  if (!res.ok) return null;
  return res.json();
}

export default async function OfficialExamDetailsLegacyPage({ params }) {
  const { provider, examCode } = await params;
  const exam = await fetchExam(provider, examCode);

  if (!exam) notFound();

  const slug =
    (exam.slug && String(exam.slug).trim()) ||
    `${provider}-${examCode}`.toLowerCase().replace(/_/g, "-");

  redirect(
    getOfficialExamInfoPathFromExam({
      slug,
      title: exam.title || exam.name || "",
      code: exam.code || examCode,
    })
  );
}



