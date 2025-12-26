"use client";

import { useState, useEffect, useMemo } from "react";
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
import { ArrowRight, Calendar, User, Clock, Search } from "lucide-react";
import Link from "next/link";
import { getOptimizedImageUrl } from "@/utils/imageUtils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/home/blog-posts/`);
        const data = await res.json();
        
        if (data.success && data.data && Array.isArray(data.data)) {
          setArticles(data.data);
        } else {
          setArticles([]);
        }
      } catch (err) {
        console.error("Error fetching blog posts:", err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Set canonical URL for blog listing page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const canonicalUrl = "https://allexamquestions.com/blog";
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", canonicalUrl);
    }
  }, []);

  // Extract unique categories from articles
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(articles.map(article => article.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [articles]);

  // Filter articles based on search query and selected category
  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(article => 
        article.title?.toLowerCase().includes(query) ||
        article.excerpt?.toLowerCase().includes(query) ||
        article.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [articles, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
            <p className="text-[#0C1A35]/70">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0C1A35] via-[#0F2847] to-[#132A54] py-16 px-4">
        <div className="container mx-auto max-w-7xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Preparation Guides & Tips
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Expert advice and strategies to maximize your exam success
          </p>
        </div>
      </section>

      {/* Blog Articles */}
      <section className="py-16 px-4 bg-[#F5F8FC]">
        <div className="container mx-auto max-w-7xl">
          {/* Search and Filter Section */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search Bar */}
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

              {/* Category Filter Dropdown */}
              <div className="w-full md:w-[200px]">
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

              {/* Clear Filters Button */}
              {(searchQuery || (selectedCategory && selectedCategory !== "all")) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="h-11 min-h-[44px] text-[#0C1A35] hover:text-[#1A73E8]"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results Count */}
            {(searchQuery || (selectedCategory && selectedCategory !== "all")) && (
              <div className="text-sm text-[#0C1A35]/70">
                Showing {filteredArticles.length} of {articles.length} blog posts
                {selectedCategory && selectedCategory !== "all" && ` in "${selectedCategory}"`}
                {searchQuery && ` matching "${searchQuery}"`}
              </div>
            )}
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#0C1A35]/70 text-lg">No blog posts available at the moment.</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#0C1A35]/70 text-lg">No blog posts found matching your search criteria.</p>
              {(searchQuery || (selectedCategory && selectedCategory !== "all")) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-4 h-11 min-h-[44px] text-[#1A73E8] hover:text-[#1557B0]"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => {
                const blogUrl = article.slug ? `/blog/${article.slug}` : '#';
                const articleDate = article.created_at 
                  ? new Date(article.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Date not available';

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
                            style={{ objectFit: 'contain' }}
                            loading="lazy"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                            decoding="async"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x300/1A73E8/ffffff?text=Blog+Post';
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
          )}
        </div>
      </section>
    </div>
  );
}

