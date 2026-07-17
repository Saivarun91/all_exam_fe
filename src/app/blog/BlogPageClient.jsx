"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Calendar, Search } from "lucide-react";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import OptimizedImage from "@/components/common/OptimizedImage";

const FALLBACK_POSTS_PER_PAGE = 9;

function buildBlogListUrl(apiBaseUrl, params) {
  const url = new URL(`${apiBaseUrl}/api/home/blog-posts/all/`);
  Object.entries(params).forEach(([key, value]) => {
    const normalized = String(value ?? "").trim();
    if (normalized) url.searchParams.set(key, normalized);
  });
  return url.toString();
}

export default function BlogPageClient({
  initialArticles,
  initialCategories = [],
  initialPagination,
  apiBaseUrl,
  pageSize = FALLBACK_POSTS_PER_PAGE,
}) {
  const [articles, setArticles] = useState(initialArticles);
  const [pagination, setPagination] = useState(initialPagination);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const hasMounted = useRef(false);
  const resultsTopRef = useRef(null);

  const categories = useMemo(
    () =>
      initialCategories.length
        ? initialCategories
        : [...new Set(articles.map((a) => a.category).filter(Boolean))].sort((a, b) =>
            a.localeCompare(b)
          ),
    [articles, initialCategories]
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const controller = new AbortController();
    const timeout = globalThis.setTimeout(async () => {
      try {
        setIsLoadingPage(true);
        const res = await fetch(
          buildBlogListUrl(apiBaseUrl, {
            page: currentPage,
            page_size: pageSize,
            lite: 1,
            search: searchQuery,
            category: selectedCategory === "all" ? "" : selectedCategory,
          }),
          { signal: controller.signal, headers: { Accept: "application/json" } }
        );
        const data = await res.json();
        if (data?.success && Array.isArray(data.data)) {
          setArticles(data.data);
          setPagination(data.pagination || null);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching blog posts:", err);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingPage(false);
      }
    }, 250);

    return () => {
      controller.abort();
      globalThis.clearTimeout(timeout);
    };
  }, [apiBaseUrl, currentPage, pageSize, searchQuery, selectedCategory]);

  const totalResults = pagination?.count ?? articles.length;
  const totalPages = Math.max(1, pagination?.total_pages || 1);
  const visibleArticles = articles;
  const goToPage = (page) => {
    const nextPage = Math.min(totalPages, Math.max(1, page));
    if (nextPage === currentPage) return;

    setCurrentPage(nextPage);
    resultsTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div ref={resultsTopRef} className="container mx-auto max-w-7xl scroll-mt-24">
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full md:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0C1A35]/50" />
              <Input
                type="text"
                placeholder="Search blogs by title, content, or category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-11 min-h-[44px] bg-white border-[#BFD4F5] text-sm text-[#0C1A35] placeholder:text-[#0C1A35]/70"
              />
            </div>
          </div>

          <div className="w-full md:w-[220px]">
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full bg-white border-[#BFD4F5] h-11 min-h-[44px] text-sm text-[#0C1A35]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="min-h-[44px]">
                  All Categories
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="min-h-[44px]">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || (selectedCategory && selectedCategory !== "all")) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setCurrentPage(1);
              }}
              className="h-11 min-h-[44px] text-[#0C1A35] hover:text-[#1A73E8]"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {(searchQuery || (selectedCategory && selectedCategory !== "all")) && (
          <div className="text-sm text-[#0C1A35]/70">
            Showing {totalResults} blog posts
            {selectedCategory && selectedCategory !== "all" && ` in "${selectedCategory}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </div>

      {visibleArticles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#0C1A35]/70 text-lg">No blog posts found matching your search criteria.</p>
          {(searchQuery || (selectedCategory && selectedCategory !== "all")) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setCurrentPage(1);
              }}
              className="mt-4 h-11 min-h-[44px] text-[#1A73E8] hover:text-[#1557B0]"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${isLoadingPage ? "opacity-60" : ""}`}>
            {visibleArticles.map((article) => {
              const blogUrl = article.slug ? `/blog/${article.slug}` : "#";
              const articleDate = article.created_at
                ? new Date(article.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Date not available";

              return (
                <Link key={article.id} href={blogUrl} className="block group">
                  <Card className="overflow-hidden hover:shadow-[0_6px_20px_rgba(26,115,232,0.15)] hover:-translate-y-1 transition-all duration-300 border-[#DDE7FF] cursor-pointer bg-white shadow-[0_2px_8px_rgba(26,115,232,0.08)] h-full flex flex-col">
                    {article.image_url ? (
                      <div className="relative w-full bg-gray-50 flex items-center justify-center p-3">
                        <OptimizedImage
                          src={getOptimizedImageUrl(article.image_url, 600, 600, "fit")}
                          alt={article.title}
                          width={600}
                          height={600}
                          crop="fit"
                          className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                          containerClassName="w-full"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                          fallbackSrc="https://via.placeholder.com/400x300/1A73E8/ffffff?text=Blog+Post"
                        />
                        {article.category && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-[#1A73E8] text-white text-xs font-semibold px-3 py-1 rounded-full">
                              {article.category}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#1A73E8]/10 to-purple-500/10 flex items-center justify-center">
                        <span className="text-[#0C1A35]/30 text-sm">No image</span>
                      </div>
                    )}

                    <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 text-sm text-[#0C1A35]/60">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{articleDate}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-[#0C1A35] group-hover:text-[#1A73E8] transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-[#0C1A35]/70 line-clamp-3 flex-1">{article.excerpt}</p>

                      <div className="flex items-center text-[#1A73E8] font-semibold group-hover:translate-x-2 transition-transform pt-2">
                        Read More
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#0C1A35]/70">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || isLoadingPage}
                className="min-h-[40px]"
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    onClick={() => goToPage(pageNum)}
                    disabled={isLoadingPage}
                    className={`min-w-[40px] min-h-[40px] ${
                      pageNum === currentPage
                        ? "bg-[#1A73E8] hover:bg-[#1557B0] text-white"
                        : ""
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || isLoadingPage}
                className="min-h-[40px]"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
