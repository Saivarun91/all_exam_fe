"use client";

import { useState } from "react";
import Link from "next/link";
import { getExamUrl } from "@/lib/utils";

const INITIAL_EXAM_COUNT = 5;

export default function ProviderCardExams({ exams = [] }) {
  const [showAll, setShowAll] = useState(false);

  if (!exams.length) return null;

  const visibleExams = showAll ? exams : exams.slice(0, INITIAL_EXAM_COUNT);
  const hasMore = exams.length > INITIAL_EXAM_COUNT;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <ul className="flex flex-col gap-2 list-none p-0 m-0">
        {visibleExams.map((exam) => (
          <li key={exam.id || exam.slug || `${exam.provider_slug}-${exam.code}`}>
            <Link
              href={getExamUrl(exam)}
              prefetch={false}
              className="block text-sm text-[#1A73E8] hover:underline leading-snug break-words cursor-pointer"
              title={exam.title || exam.name || exam.code || ""}
            >
              {exam.title || exam.name || exam.code || "Exam"}
            </Link>
          </li>
        ))}
      </ul>

      {hasMore ? (
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="self-start text-sm font-medium text-[#1A73E8] hover:underline cursor-pointer"
        >
          {showAll ? "Show less" : `View all (${exams.length})`}
        </button>
      ) : null}
    </div>
  );
}
