"use client";

import { useEffect, useMemo, useState } from "react";
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
import { ArrowRight, Calendar, Clock, Search } from "lucide-react";
import { getOptimizedImageUrl } from "@/utils/imageUtils";

const POSTS_PER_PAGE = 9;

export default function BlogPageClient({ articles }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(
    () => [...new Set(articles.map((a) => a.category).filter(Boolean))].sort(),
    [articles]
  );

  const filteredArticles = useMemo(() => {
    let filtered = articles;

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((article) => article.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (article) =>
          article.title?.toLowerCase().includes(query) ||
          article.excerpt?.toLowerCase().includes(query) ||
          article.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [articles, searchQuery, selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / POSTS_PER_PAGE));
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full md:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0C1A35]/50" />
              <Input
                type="text"
                placeholder="Search blogs by title, content, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 min-h-[44px] bg-white border-[#BFD4F5] text-sm text-[#0C1A35] placeholder:text-[#0C1A35]/70"
              />
            </div>
          </div>

          <div className="w-full md:w-[220px]">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
            Showing {filteredArticles.length} of {articles.length} blog posts
            {selectedCategory && selectedCategory !== "all" && ` in "${selectedCategory}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </div>

      {filteredArticles.length === 0 ? (
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedArticles.map((article) => {
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
                      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                        <img
                          src={getOptimizedImageUrl(article.image_url, 400, 225)}
                          alt={article.title}
                          width={400}
                          height={225}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          style={{ objectFit: "contain" }}
                          loading="lazy"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                          decoding="async"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/400x300/1A73E8/ffffff?text=Blog+Post";
                          }}
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
                        {article.reading_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{article.reading_time}</span>
                          </div>
                        )}
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
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
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
                    onClick={() => setCurrentPage(pageNum)}
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
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
