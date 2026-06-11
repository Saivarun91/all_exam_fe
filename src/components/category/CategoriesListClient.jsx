"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Folder, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import CategoryCard from "@/components/category/CategoryCard";
import ListPagination, {
  getListPaginationSlice,
} from "@/components/common/ListPagination";
import { t, tf } from "@/lib/uiStrings";
import { resolveCategoryImageUrl } from "@/lib/categoryImage";

const TOP_CATEGORIES_PAGE_SIZE = 8;

function CategoryListItem({ category }) {
  const title = category?.title || category?.name || "";
  const imageSrc = resolveCategoryImageUrl(category?.image_url);

  return (
    <Link
      key={category.id}
      href={`/categories/${category.slug}`}
      className="group flex items-center justify-between text-[16px]"
    >
      <span className="flex items-center gap-3 min-w-0">
        {imageSrc ? (
          <span className="w-10 h-10 rounded-lg border border-[#DDE7FF] bg-[#F7FAFF] flex items-center justify-center p-1 shrink-0">
            <img
              src={imageSrc}
              alt={title || t("common.category")}
              className="w-full h-full object-contain"
              loading="lazy"
              decoding="async"
            />
          </span>
        ) : (
          <span className="w-10 h-10 rounded-lg bg-[#1A73E8]/10 flex items-center justify-center shrink-0">
            <Folder className="w-5 h-5 text-[#1A73E8]" />
          </span>
        )}
        <span className="font-medium text-[#1A73E8] group-hover:text-[#1557B0] group-hover:underline underline-offset-4 transition-colors truncate">
          {title}
        </span>
      </span>
      <span className="text-sm text-[#0C1A35]/55">
        {category.examCount || 0}{" "}
        {(category.examCount || 0) === 1
          ? t("common.exam_singular")
          : t("common.exam_plural")}
      </span>
    </Link>
  );
}

export default function CategoriesListClient({
  groupedCategories = {},
  topCertificationCategories = [],
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [topCategoriesPage, setTopCategoriesPage] = useState(1);
  const formatSectionHeading = (heading) => {
    const text = String(heading || "").trim();
    if (!text) return t("common.categories");
    return /categories$/i.test(text)
      ? text
      : `${text} ${t("common.categories_suffix")}`;
  };

  const { filteredTopCategories, filteredGroups } = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return {
        filteredTopCategories: topCertificationCategories,
        filteredGroups: groupedCategories,
      };
    }

    const nextGroups = {};
    Object.entries(groupedCategories).forEach(([heading, items]) => {
      const matched = (items || []).filter((category) => {
        const title = String(category?.title || "").toLowerCase();
        const description = String(category?.description || "").toLowerCase();
        const groupHeading = String(heading || "").toLowerCase();
        return (
          title.includes(query) ||
          description.includes(query) ||
          groupHeading.includes(query)
        );
      });
      if (matched.length > 0) nextGroups[heading] = matched;
    });
    const nextTopCategories = (topCertificationCategories || []).filter((category) => {
      const title = String(category?.title || "").toLowerCase();
      const description = String(category?.description || "").toLowerCase();
      return title.includes(query) || description.includes(query);
    });
    return {
      filteredTopCategories: nextTopCategories,
      filteredGroups: nextGroups,
    };
  }, [groupedCategories, searchTerm, topCertificationCategories]);

  useEffect(() => {
    setTopCategoriesPage(1);
  }, [searchTerm]);

  const topCategoriesPagination = useMemo(
    () =>
      getListPaginationSlice(
        filteredTopCategories,
        topCategoriesPage,
        TOP_CATEGORIES_PAGE_SIZE
      ),
    [filteredTopCategories, topCategoriesPage]
  );

  const hasResults =
    filteredTopCategories.length > 0 || Object.keys(filteredGroups).length > 0;

  return (
    <>
      <div className="mb-8">
        <div className="relative max-w-lg">
          <Search className="w-4 h-4 text-[#0C1A35]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("common.search_categories")}
            className="pl-10 border-[#DDE7FF] focus-visible:ring-[#1A73E8]"
          />
        </div>
      </div>

      {hasResults ? (
        <>
          <section id="top-certification-categories" className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0C1A35] mb-5">
              {t("common.top_certification_categories")}
            </h2>

            {filteredTopCategories.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topCategoriesPagination.items.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      showExamCount
                      imageFit="contain"
                    />
                  ))}
                </div>

                <ListPagination
                  currentPage={topCategoriesPagination.page}
                  totalPages={topCategoriesPagination.totalPages}
                  totalItems={topCategoriesPagination.totalItems}
                  pageSize={TOP_CATEGORIES_PAGE_SIZE}
                  itemLabelKey="pagination.categories"
                  scrollTargetId="top-certification-categories"
                  onPageChange={setTopCategoriesPage}
                />
              </>
            ) : (
              <div className="rounded-lg border border-[#DDE7FF] bg-[#F8FBFF] px-4 py-3 text-sm text-[#0C1A35]/70">
                {t("categories.no_top_selected")}
              </div>
            )}
          </section>

          <div className="columns-1 lg:columns-2 gap-8">
            {Object.entries(filteredGroups).map(([heading, groupedItems]) => (
              <section
                key={heading}
                className="mb-8 break-inside-avoid rounded-2xl border border-[#DDE7FF] bg-white p-5 shadow-sm"
              >
                <h2 className="text-2xl md:text-[28px] font-bold text-[#0C1A35] mb-4">
                  {formatSectionHeading(heading)}
                </h2>

                <div className="space-y-2.5">
                  {groupedItems.map((category) => (
                    <CategoryListItem key={category.id} category={category} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : (
        <div className="py-12 text-center text-[#0C1A35]/60">
          {t("common.no_categories_found")} &quot;{searchTerm}&quot;.
        </div>
      )}
    </>
  );
}
