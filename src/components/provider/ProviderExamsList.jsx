"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getExamUrl } from "@/lib/utils";
import ListPagination, {
  PROVIDER_LIST_PAGE_SIZE,
  getListPaginationSlice,
} from "@/components/common/ListPagination";
import { t, tf } from "@/lib/uiStrings";

function getExamListKey(exam, index) {
  const id = exam?.id ?? exam?._id;
  if (id != null && String(id).trim() !== "") {
    return String(id);
  }
  const slug = (exam?.slug || "").trim();
  if (slug) {
    return `${slug}--${index}`;
  }
  return `exam-${index}`;
}

function ProviderExamCard({ exam, providerName }) {
  const examTitle = exam?.title || exam?.name || "";

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#DDE7FF] bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4">
        <p className="mb-1 text-sm font-medium text-[#1A73E8]">{providerName}</p>
        <h3 className="mb-1 text-lg font-bold text-[#0C1A35]">{examTitle}</h3>
        {exam.code ? (
          <p className="mb-2 text-sm text-[#0C1A35]/60">{exam.code}</p>
        ) : null}
        <p className="text-sm text-[#0C1A35]/70">
          {tf("common.exam_meta", {
            practiceExams:
              exam.practice_tests_list?.length || exam.practice_exams || 0,
            questions:
              exam.practice_tests_list?.reduce(
                (sum, item) => sum + (parseInt(item.questions, 10) || 0),
                0
              ) ||
              exam.questions ||
              0,
          })}
        </p>
      </div>
      <Link
        href={getExamUrl(exam)}
        className="inline-flex items-center justify-center rounded-lg bg-[#1A73E8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1557B0]"
      >
        {t("common.start_practicing")}
      </Link>
    </div>
  );
}

export default function ProviderExamsList({
  exams,
  providerName,
  scrollTargetId = "provider-exams-grid",
}) {
  const [listPage, setListPage] = useState(1);
  const safeExams = Array.isArray(exams) ? exams : [];

  const pagination = useMemo(
    () => getListPaginationSlice(safeExams, listPage, PROVIDER_LIST_PAGE_SIZE),
    [safeExams, listPage]
  );

  if (safeExams.length === 0) {
    return <p className="text-[#0C1A35]/60">{t("common.no_exams")}</p>;
  }

  return (
    <>
      <div
        id="provider-exams-grid"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {pagination.items.map((exam, index) => (
          <ProviderExamCard
            key={getExamListKey(exam, pagination.startIndex + index)}
            exam={exam}
            providerName={providerName}
          />
        ))}
      </div>

      <ListPagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={PROVIDER_LIST_PAGE_SIZE}
        itemLabelKey="pagination.exams"
        scrollTargetId={scrollTargetId}
        onPageChange={setListPage}
      />
    </>
  );
}
