"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

/** Default for /exams listing */
export const DEFAULT_LIST_PAGE_SIZE = 12;
/** 3×3 grid on category pages */
export const CATEGORY_LIST_PAGE_SIZE = 9;
/** 4×2 grid on provider detail pages */
export const PROVIDER_LIST_PAGE_SIZE = 8;

export function getListPaginationSlice(items, currentPage, pageSize = DEFAULT_LIST_PAGE_SIZE) {
  const safeItems = Array.isArray(items) ? items : [];
  const totalItems = safeItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (page - 1) * pageSize;

  return {
    page,
    totalPages,
    totalItems,
    startIndex,
    endIndex: Math.min(startIndex + pageSize, totalItems),
    items: safeItems.slice(startIndex, startIndex + pageSize),
  };
}

function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const items = [];

  sorted.forEach((page, index) => {
    const prev = sorted[index - 1];
    if (index > 0 && page - prev > 1) {
      items.push("ellipsis");
    }
    items.push(page);
  });

  return items;
}

export default function ListPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems = 0,
  pageSize = DEFAULT_LIST_PAGE_SIZE,
  itemLabel,
  itemLabelKey = "pagination.items",
  scrollTargetId,
  className = "",
}) {
  const { t, tf } = useLanguage();

  const resolvedItemLabel = itemLabel || t(itemLabelKey);

  const pageItems = useMemo(
    () => buildPageItems(currentPage, totalPages),
    [currentPage, totalPages]
  );

  if (totalItems === 0) {
    return null;
  }

  const showPageControls = totalPages > 1;

  const goToPage = (page) => {
    const next = Math.min(Math.max(1, page), totalPages);
    if (next === currentPage) return;
    onPageChange(next);
    if (scrollTargetId && typeof document !== "undefined") {
      const el = document.getElementById(scrollTargetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={`mt-8 flex flex-col gap-4 rounded-xl border border-[#DDE7FF] bg-[#F5F8FC] px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
      role="navigation"
      aria-label={t("common.pagination")}
    >
      <p className="text-sm text-[#0C1A35]/70">
        {tf("common.showing_range", {
          start,
          end,
          total: totalItems,
          label: resolvedItemLabel,
        })}
        {showPageControls ? (
          <span className="text-[#0C1A35]/50">
            {" "}
            ·{" "}
            {tf("common.page_of", {
              current: currentPage,
              total: totalPages,
            })}
          </span>
        ) : null}
      </p>

      {showPageControls ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="min-h-[40px] border-[#DDE7FF] text-[#0C1A35] hover:bg-white hover:text-[#1A73E8]"
          >
            {t("common.previous")}
          </Button>

          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="inline-flex min-w-[40px] items-center justify-center text-[#0C1A35]/50"
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === currentPage ? "default" : "outline"}
                onClick={() => goToPage(item)}
                className={`min-h-[40px] min-w-[40px] ${
                  item === currentPage
                    ? "bg-[#1A73E8] hover:bg-[#1557B0] text-white border-[#1A73E8]"
                    : "border-[#DDE7FF] text-[#0C1A35] hover:bg-white hover:text-[#1A73E8]"
                }`}
              >
                {item}
              </Button>
            )
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="min-h-[40px] border-[#DDE7FF] text-[#0C1A35] hover:bg-white hover:text-[#1A73E8]"
          >
            {t("common.next")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
