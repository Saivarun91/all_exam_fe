"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Folder, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CategoriesListClient({
  groupedCategories = {},
  topCertificationCategories = [],
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const formatSectionHeading = (heading) => {
    const text = String(heading || "").trim();
    if (!text) return "Categories";
    return /categories$/i.test(text) ? text : `${text} Categories`;
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
            placeholder="Search categories..."
            className="pl-10 border-[#DDE7FF] focus-visible:ring-[#1A73E8]"
          />
        </div>
      </div>

      {hasResults ? (
        <>
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0C1A35] mb-5">
              Top Certification Categories
            </h2>

            {filteredTopCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="block h-full group"
                  >
                    <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all border-[#DDE7FF] cursor-pointer">
                      <CardContent className="p-6 h-full flex flex-col space-y-4">
                        <div className="w-12 h-12 rounded-lg bg-[#1A73E8]/10 flex items-center justify-center">
                          <Folder className="w-6 h-6 text-[#1A73E8]" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-xl font-bold text-[#0C1A35] group-hover:text-[#1A73E8] transition-colors">
                              {category.title}
                            </h3>
                            <span className="shrink-0 rounded-full bg-[#1A73E8]/10 px-2.5 py-1 text-xs font-semibold text-[#1A73E8]">
                              {category.examCount || 0} Exam
                              {(category.examCount || 0) !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {category.description && (
                            <p className="text-sm text-[#0C1A35]/60 mt-1">
                              {category.description}
                            </p>
                          )}
                        </div>

                        <Button
                          asChild
                          className="w-full mt-auto bg-[#1A73E8] text-white hover:bg-[#1557B0]"
                        >
                          <span>
                            View Exams
                            <ArrowRight className="ml-2 w-4 h-4 inline-block" />
                          </span>
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-[#DDE7FF] bg-[#F8FBFF] px-4 py-3 text-sm text-[#0C1A35]/70">
                No top certification categories selected yet.
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
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="group flex items-center justify-between text-[16px]"
                    >
                      <span className="font-medium text-[#1A73E8] group-hover:text-[#1557B0] group-hover:underline underline-offset-4 transition-colors">
                        {category.title}
                      </span>
                      <span className="text-sm text-[#0C1A35]/55">
                        {category.examCount || 0}{" "}
                        {(category.examCount || 0) === 1 ? "Exam" : "Exams"}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : (
        <div className="py-12 text-center text-[#0C1A35]/60">
          No categories found for "{searchTerm}".
        </div>
      )}
    </>
  );
}
