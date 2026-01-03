"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Star,
  Sparkles,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { createSlug, getExamUrl } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function ExamsPageContent({ 
  initialProvider = [], 
  initialKeyword = "",
  usePathBasedRouting = false 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
  const [selectedProviders, setSelectedProviders] = useState(initialProvider);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [minQuestions, setMinQuestions] = useState(0);
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allExams, setAllExams] = useState([]);
  const [trustBarItems, setTrustBarItems] = useState([]);
  const [aboutSection, setAboutSection] = useState({ heading: "", content: "" });
  const [loading, setLoading] = useState(true);
  const isInitializing = useRef(true);
  const hasInitialized = useRef(false);

  // Helper function to build SEO-friendly URL
  const buildSEOUrl = (newProviders, newCategories, newKeyword) => {
    if (usePathBasedRouting) {
      // Path-based routing: /exams/provider or /exams/provider/search/keyword or /exams/search/keyword
      if (newProviders.length > 0 && newKeyword && newKeyword.trim()) {
        // Provider + keyword: /exams/provider/search/keyword
        const provider = newProviders[0];
        const keyword = encodeURIComponent(createSlug(newKeyword.trim()));
        return `/exams/${provider}/search/${keyword}`;
      } else if (newProviders.length > 0) {
        // Provider only: /exams/provider
        return `/exams/${newProviders[0]}`;
      } else if (newKeyword && newKeyword.trim()) {
        // Keyword only: /exams/search/keyword
        const keyword = encodeURIComponent(createSlug(newKeyword.trim()));
        return `/exams/search/${keyword}`;
      } else {
        // No filters: /exams
        return `/exams`;
      }
    } else {
      // Query parameter routing (backward compatibility)
      const params = new URLSearchParams();
      
      if (newKeyword && newKeyword.trim()) {
        params.set("q", newKeyword.trim());
      }
      
      if (newProviders && newProviders.length > 0) {
        params.set("provider", newProviders.join(","));
      }
      
      if (newCategories && newCategories.length > 0) {
        params.set("category", newCategories.join(","));
      }
      
      return `/exams${params.toString() ? `?${params.toString()}` : ""}`;
    }
  };

  // Helper function to update URL with current filters
  const updateURL = (newProviders, newCategories, newKeyword) => {
    const newUrl = buildSEOUrl(newProviders, newCategories, newKeyword);
    router.replace(newUrl, { scroll: false });
  };

  // Initialize from URL params if available (only on first mount and not using path-based routing)
  useEffect(() => {
    if (usePathBasedRouting) {
      // If using path-based routing, initial values are already set via props
      hasInitialized.current = true;
      setTimeout(() => {
        isInitializing.current = false;
      }, 100);
      return;
    }

    if (hasInitialized.current) return;
    
    const q = searchParams?.get("q");
    const providerParam = searchParams?.get("provider");
    const categoryParam = searchParams?.get("category");
    
    isInitializing.current = true;
    
    if (q) setSearchKeyword(q);
    if (providerParam) {
      // Handle comma-separated providers or single provider
      const providersList = providerParam.split(",").filter(p => p.trim());
      setSelectedProviders(providersList);
    }
    if (categoryParam) {
      // Handle comma-separated categories or single category
      const categoriesList = categoryParam.split(",").filter(c => c.trim());
      setSelectedCategories(categoriesList);
    }
    
    hasInitialized.current = true;
    
    // Mark initialization as complete
    setTimeout(() => {
      isInitializing.current = false;
    }, 100);
  }, [searchParams, usePathBasedRouting]);

  // Handle provider checkbox toggle
  const handleProviderToggle = (providerSlug) => {
    const newProviders = selectedProviders.includes(providerSlug)
      ? selectedProviders.filter(p => p !== providerSlug)
      : [...selectedProviders, providerSlug];
    
    setSelectedProviders(newProviders);
    
    // Update URL immediately
    if (!isInitializing.current) {
      updateURL(newProviders, selectedCategories, searchKeyword);
    }
  };

  // Handle category checkbox toggle
  const handleCategoryToggle = (categorySlug) => {
    const newCategories = selectedCategories.includes(categorySlug)
      ? selectedCategories.filter(c => c !== categorySlug)
      : [...selectedCategories, categorySlug];
    
    setSelectedCategories(newCategories);
    
    // Update URL immediately
    if (!isInitializing.current) {
      updateURL(selectedProviders, newCategories, searchKeyword);
    }
  };

  // Fetch all data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch providers
        const providersRes = await fetch(`${API_BASE_URL}/api/providers/`);
        const providersData = await providersRes.json();
        if (Array.isArray(providersData)) {
          setProviders(providersData.filter(p => p.is_active));
        }

        // Fetch categories
        const categoriesRes = await fetch(`${API_BASE_URL}/api/categories/`);
        const categoriesData = await categoriesRes.json();
        console.log("Categories data received:", categoriesData);
        if (Array.isArray(categoriesData)) {
          const activeCategories = categoriesData.filter(c => c.is_active !== false);
          console.log("Active categories:", activeCategories);
          setCategories(activeCategories);
        }

        // Fetch courses/exams
        const coursesRes = await fetch(`${API_BASE_URL}/api/courses/`);
        const coursesData = await coursesRes.json();
        console.log("Courses data received:", coursesData);
        if (Array.isArray(coursesData)) {
          const activeExams = coursesData.filter(c => c.is_active !== false);
          console.log("Active exams:", activeExams);
          setAllExams(activeExams);
        }

        // Fetch trust bar items
        const trustBarRes = await fetch(`${API_BASE_URL}/api/home/exams-trust-bar/`);
        const trustBarData = await trustBarRes.json();
        if (trustBarData.success) {
          setTrustBarItems(trustBarData.data || []);
        }

        // Fetch about section
        const aboutRes = await fetch(`${API_BASE_URL}/api/home/exams-about/`);
        const aboutData = await aboutRes.json();
        if (aboutData.success) {
          setAboutSection(aboutData.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSearch = () => {
    // State is already updated from search bar inputs
    // Just update the URL to reflect current filters
    // The filteredExams useMemo will automatically update when state changes
    updateURL(selectedProviders, selectedCategories, searchKeyword);
    
    // Scroll to results section
    setTimeout(() => {
      const resultsSection = document.getElementById('results-section');
      if (resultsSection) {
        // Use requestAnimationFrame to avoid forced reflow
        requestAnimationFrame(() => {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const filteredExams = useMemo(() => {
    return allExams.filter((exam) => {
      // Filter by providers (multiple selection with checkboxes)
      if (selectedProviders.length > 0) {
        const examProvider = exam.provider?.toLowerCase();
        const matchesProvider = selectedProviders.some(providerSlug => {
          const providerName = providers.find((p) => p.slug === providerSlug)?.name || providerSlug;
          return examProvider === providerName.toLowerCase();
        });
        if (!matchesProvider) {
          return false;
        }
      }

      // Filter by categories (multiple selection with checkboxes)
      if (selectedCategories.length > 0) {
        const examCategory = exam.category?.toLowerCase();
        const matchesCategory = selectedCategories.some(catSlug => {
          const categoryName = categories.find((c) => c.slug === catSlug)?.name || catSlug;
          return examCategory === categoryName.toLowerCase();
        });
        if (!matchesCategory) {
          return false;
        }
      }

      // Filter by search keyword
      if (searchKeyword) {
        const q = searchKeyword.toLowerCase();
        const title = exam.title?.toLowerCase() || "";
        const code = exam.code?.toLowerCase() || "";
        const provider = exam.provider?.toLowerCase() || "";
        if (!title.includes(q) && !code.includes(q) && !provider.includes(q)) {
          return false;
        }
      }

      // Filter by minimum questions
      if (exam.questions < minQuestions) {
        return false;
      }

      return true;
    });
  }, [selectedProviders, selectedCategories, searchKeyword, minQuestions, providers, categories, allExams]);

  const totalQuestions = filteredExams.reduce((sum, exam) => sum + (exam.questions || 0), 0);
  const updatedThisWeek = filteredExams.length; // All are considered recent

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
          <p className="text-[#0C1A35]/70">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* SEARCH BAR SECTION - Exact Design Match */}
      <section className="bg-[#0C1A35] pt-12 pb-20 relative overflow-hidden">
        {/* Curved white shape at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-white rounded-t-[4rem]"></div>
        
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          {/* Semi-transparent dark blue container with rounded corners and shadow */}
          <div className="bg-[#0C1A35]/80 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 p-5">
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              {/* Dropdown - Left side */}
              <Select 
                value={selectedProviders.length > 0 ? selectedProviders[0] : "all"} 
                onValueChange={(value) => {
                  const newProviders = value === "all" ? [] : [value];
                  setSelectedProviders(newProviders);
                  
                  // Update URL immediately
                  if (!isInitializing.current) {
                    updateURL(newProviders, selectedCategories, searchKeyword);
                  }
                }}
              >
                <SelectTrigger className="w-full md:w-[200px] bg-gray-100 border-0 h-12 text-sm text-gray-700 font-medium rounded-lg min-h-12">
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.slug}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search Input - Middle */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A73E8] z-10" />
                <Input
                  placeholder="Search by exam name, code, or keyword..."
                  className="pl-12 pr-4 bg-gray-100 border-0 h-12 text-sm text-gray-700 placeholder:text-gray-400 rounded-lg min-h-12"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>

              {/* Search Button - Right side */}
              <Button
                onClick={handleSearch}
                className="bg-[#1A73E8] text-white hover:bg-[#1557B0] w-full md:w-auto px-8 h-12 text-sm font-medium rounded-lg shadow-lg transition-all min-h-12"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section id="results-section" className="py-8 px-4 bg-white -mt-8">
        <div className="container mx-auto max-w-7xl">
          {/* Results Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#0C1A35] mb-2">
              Showing {filteredExams.length} results for All Popular Exams
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-[#0C1A35]/70">
              <span>{updatedThisWeek} exams updated this week</span>
              <span>•</span>
              <span>{totalQuestions.toLocaleString()}+ questions available</span>
            </div>
          </div>

          {/* Trust Bar - Dynamic from Admin */}
          {trustBarItems.length > 0 && (
            <Card className="p-4 mb-6 border border-gray-200 bg-white shadow-sm">
              <div className={`grid grid-cols-2 md:grid-cols-${Math.min(trustBarItems.length, 4)} gap-4 text-center`}>
                {trustBarItems.map((item, index) => {
                  // Map icon names to components
                  const IconComponent = {
                    CheckCircle2,
                    Clock,
                    Users,
                    BarChart3,
                    TrendingUp,
                    Star,
                    Sparkles,
                  }[item.icon] || CheckCircle2;

                  return (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <IconComponent className="w-5 h-5 text-[#1A73E8]" />
                      <div>
                        <div className="font-semibold text-[#0C1A35]">{item.label}</div>
                        <div className="text-xs text-[#0C1A35]/60">{item.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* LEFT FILTERS */}
            <div className="lg:col-span-1">
              <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-[#0C1A35] mb-6">Filters</h3>

                {/* Providers - Using Checkboxes */}
                <div className="mb-6">
                  <Label className="text-[#0C1A35] font-medium mb-3 block text-sm">Providers</Label>
                  <div className="space-y-2.5 max-h-[200px] overflow-y-auto">
                    {providers.length > 0 ? (
                      providers.map((provider) => (
                        <div key={provider.id || provider.slug} className="flex items-center space-x-2.5">
                          <Checkbox 
                            id={`provider-${provider.slug}`}
                            checked={selectedProviders.includes(provider.slug)}
                            onCheckedChange={() => handleProviderToggle(provider.slug)}
                            className="border-gray-300"
                          />
                          <Label 
                            htmlFor={`provider-${provider.slug}`} 
                            className="text-sm text-[#0C1A35] cursor-pointer font-normal"
                          >
                            {provider.name}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 py-2">
                        No providers available.
                      </div>
                    )}
                  </div>
                </div>

                {/* Categories - Using Checkboxes */}
                <div className="mb-6">
                  <Label className="text-[#0C1A35] font-medium mb-3 block text-sm">Categories</Label>
                  <div className="space-y-2.5 max-h-[200px] overflow-y-auto">
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <div key={cat.id || cat.slug} className="flex items-center space-x-2.5">
                          <Checkbox 
                            id={cat.slug}
                            checked={selectedCategories.includes(cat.slug)}
                            onCheckedChange={() => handleCategoryToggle(cat.slug)}
                            className="border-gray-300"
                          />
                          <Label 
                            htmlFor={cat.slug} 
                            className="text-sm text-[#0C1A35] cursor-pointer font-normal"
                          >
                            {cat.name}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 py-2">
                        No categories available. Admin can add categories from the admin panel.
                      </div>
                    )}
                  </div>
                </div>

                {/* Updated */}
                <div className="mb-6">
                  <Label className="text-[#0C1A35] font-medium mb-3 block text-sm">Updated</Label>
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="bg-white border-gray-300 h-10 text-sm">
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Minimum Questions */}
                <div>
                  <Label className="text-[#0C1A35] font-medium mb-3 block text-sm">Minimum Questions</Label>
                  <Input
                    type="number"
                    value={minQuestions}
                    onChange={(e) => setMinQuestions(Number(e.target.value) || 0)}
                    className="bg-white border-gray-300 h-10 text-sm"
                    placeholder="0"
                  />
                </div>
              </Card>
            </div>

            {/* EXAM GRID */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredExams.map((exam) => (
                  <Card
                    key={exam.id}
                    className="p-6 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all bg-white shadow-sm"
                  >
                    <div className="flex gap-2 mb-3">
                      <Badge variant="secondary" className="bg-gray-100 text-[#0C1A35] border-0 text-xs font-medium">
                        {exam.provider}
                      </Badge>
                      {exam.category && (
                        <Badge variant="secondary" className="bg-gray-100 text-[#0C1A35] border-0 text-xs font-medium">
                          {exam.category}
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-[#0C1A35] mb-1">{exam.title || exam.name}</h3>
                    <p className="text-sm text-[#0C1A35]/60 mb-3">{exam.code}</p>

                    <div className="flex gap-2 mb-3 flex-wrap">
                      {exam.badge && (
                        <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0 text-xs">
                          {exam.badge}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-[#0C1A35]/70 mb-4">
                      {exam.practice_exams || 0} Practice Exams · {(() => {
                        // Calculate total questions from practice tests list if available
                        if (exam.practice_tests_list && Array.isArray(exam.practice_tests_list) && exam.practice_tests_list.length > 0) {
                          const totalQuestions = exam.practice_tests_list.reduce((sum, test) => {
                            const testQuestions = parseInt(test.questions) || 0;
                            return sum + testQuestions;
                          }, 0);
                          return totalQuestions > 0 ? totalQuestions : (exam.questions || 0);
                        }
                        return exam.questions || 0;
                      })()} Questions
                    </p>

                    <Button
                      className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0] h-10 rounded-lg font-medium"
                      asChild
                    >
                      <Link href={getExamUrl(exam)}>
                        Start Practicing
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </Card>
                ))}
              </div>

              {filteredExams.length === 0 && (
                <Card className="p-10 text-center border border-gray-200 bg-white shadow-sm">
                  <h3 className="text-xl font-semibold text-[#0C1A35] mb-2">No exams found</h3>
                  <p className="text-sm text-[#0C1A35]/70 mb-4">
                    Try adjusting your filters or search criteria
                  </p>
                  <Button
                    onClick={() => {
                      setSearchKeyword("");
                      setSelectedProviders([]);
                      setSelectedCategories([]);
                      setMinQuestions(0);
                      updateURL([], [], "");
                    }}
                    className="bg-[#1A73E8] text-white hover:bg-[#1557B0] rounded-lg"
                  >
                    Reset Filters
                  </Button>
                </Card>
              )}
            </div>
          </div>

          {/* About Section - Dynamic from Admin */}
          {aboutSection.content && (
            <section className="mt-12 mb-8">
              <Card className="p-8 border border-gray-200 bg-white shadow-sm">
                <div 
                  className="text-[#0C1A35] mb-4"
                  dangerouslySetInnerHTML={{ 
                    __html: aboutSection.heading || "<h2 class=\"text-2xl font-bold\">About All Popular Exams Preparation</h2>"
                  }}
                />
                <div 
                  className="space-y-4 text-[#0C1A35]/80 leading-relaxed tiptap-editor-content"
                  dangerouslySetInnerHTML={{ __html: aboutSection.content }}
                />
              </Card>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}

