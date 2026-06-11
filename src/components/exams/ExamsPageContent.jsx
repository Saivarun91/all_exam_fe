// "use client";

// import { useState, useMemo, useEffect, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Search,
//   CheckCircle2,
//   Clock,
//   Users,
//   TrendingUp,
//   Star,
//   Sparkles,
//   BarChart3,
//   ArrowRight,
// } from "lucide-react";
// import { createSlug, getExamUrl } from "@/lib/utils";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// export default function ExamsPageContent({ 
//   initialProvider = [], 
//   initialKeyword = "",
//   usePathBasedRouting = false 
// }) {
//   const router = useRouter();
//   const searchParams = useSearchParams();
  
//   const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
//   const [selectedProviders, setSelectedProviders] = useState(initialProvider);
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [selectedTimeframe, setSelectedTimeframe] = useState("all");
//   const [minQuestions, setMinQuestions] = useState(0);
//   const [providers, setProviders] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [allExams, setAllExams] = useState([]);
//   const [trustBarItems, setTrustBarItems] = useState([]);
//   const [aboutSection, setAboutSection] = useState({ heading: "", content: "" });
//   const [loading, setLoading] = useState(true);
//   const isInitializing = useRef(true);
//   const hasInitialized = useRef(false);

//   // Helper function to build SEO-friendly URL
//   const buildSEOUrl = (newProviders, newCategories, newKeyword) => {
//     if (usePathBasedRouting) {
//       // Path-based routing: /exams/provider or /exams/provider/search/keyword or /exams/search/keyword
//       if (newProviders.length > 0 && newKeyword && newKeyword.trim()) {
//         // Provider + keyword: /exams/provider/search/keyword
//         const provider = newProviders[0];
//         const keyword = encodeURIComponent(createSlug(newKeyword.trim()));
//         return `/exams/${provider}/search/${keyword}`;
//       } else if (newProviders.length > 0) {
//         // Provider only: /exams/provider
//         return `/exams/${newProviders[0]}`;
//       } else if (newKeyword && newKeyword.trim()) {
//         // Keyword only: /exams/search/keyword
//         const keyword = encodeURIComponent(createSlug(newKeyword.trim()));
//         return `/exams/search/${keyword}`;
//       } else {
//         // No filters: /exams
//         return `/exams`;
//       }
//     } else {
//       // Query parameter routing (backward compatibility)
//       const params = new URLSearchParams();
      
//       if (newKeyword && newKeyword.trim()) {
//         params.set("q", newKeyword.trim());
//       }
      
//       if (newProviders && newProviders.length > 0) {
//         params.set("provider", newProviders.join(","));
//       }
      
//       if (newCategories && newCategories.length > 0) {
//         params.set("category", newCategories.join(","));
//       }
      
//       return `/exams${params.toString() ? `?${params.toString()}` : ""}`;
//     } 
//   };

//   // Helper function to update URL with current filters
//   const updateURL = (newProviders, newCategories, newKeyword) => {
//     const newUrl = buildSEOUrl(newProviders, newCategories, newKeyword);
//     router.replace(newUrl, { scroll: false });
//   };

//   // Initialize from URL params if available (only on first mount and not using path-based routing)
//   useEffect(() => {
//     if (usePathBasedRouting) {
//       // If using path-based routing, initial values are already set via props
//       hasInitialized.current = true;
//       setTimeout(() => {
//         isInitializing.current = false;
//       }, 100);
//       return;
//     }

//     if (hasInitialized.current) return;
    
//     const q = searchParams?.get("q");
//     const providerParam = searchParams?.get("provider");
//     const categoryParam = searchParams?.get("category");
    
//     isInitializing.current = true;
    
//     if (q) setSearchKeyword(q);
//     if (providerParam) {
//       // Handle comma-separated providers or single provider
//       const providersList = providerParam.split(",").filter(p => p.trim());
//       setSelectedProviders(providersList);
//     }
//     if (categoryParam) {
//       // Handle comma-separated categories or single category
//       const categoriesList = categoryParam.split(",").filter(c => c.trim());
//       setSelectedCategories(categoriesList);
//     }
    
//     hasInitialized.current = true;
    
//     // Mark initialization as complete
//     setTimeout(() => {
//       isInitializing.current = false;
//     }, 100);
//   }, [searchParams, usePathBasedRouting]);

//   // Handle provider checkbox toggle
//   const handleProviderToggle = (providerSlug) => {
//     const newProviders = selectedProviders.includes(providerSlug)
//       ? selectedProviders.filter(p => p !== providerSlug)
//       : [...selectedProviders, providerSlug];
    
//     setSelectedProviders(newProviders);
    
//     // Update URL immediately
//     if (!isInitializing.current) {
//       updateURL(newProviders, selectedCategories, searchKeyword);
//     }
//   };

//   // Handle category checkbox toggle
//   const handleCategoryToggle = (categorySlug) => {
//     const newCategories = selectedCategories.includes(categorySlug)
//       ? selectedCategories.filter(c => c !== categorySlug)
//       : [...selectedCategories, categorySlug];
    
//     setSelectedCategories(newCategories);
    
//     // Update URL immediately
//     if (!isInitializing.current) {
//       updateURL(selectedProviders, newCategories, searchKeyword);
//     }
//   };

//   // Fetch all data from backend
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch providers
//         const providersRes = await fetch(`${API_BASE_URL}/api/providers/`);
//         const providersData = await providersRes.json();
//         if (Array.isArray(providersData)) {
//           setProviders(providersData.filter(p => p.is_active));
//         }

//         // Fetch categories
//         const categoriesRes = await fetch(`${API_BASE_URL}/api/categories/`);
//         const categoriesData = await categoriesRes.json();
//         console.log("Categories data received:", categoriesData);
//         if (Array.isArray(categoriesData)) {
//           const activeCategories = categoriesData.filter(c => c.is_active !== false);
//           console.log("Active categories:", activeCategories);
//           setCategories(activeCategories);
//         }

//         // Fetch courses/exams
//         const coursesRes = await fetch(`${API_BASE_URL}/api/courses/`);
//         const coursesData = await coursesRes.json();
//         console.log("Courses data received:", coursesData);
//         if (Array.isArray(coursesData)) {
//           const activeExams = coursesData.filter(c => c.is_active !== false);
//           console.log("Active exams:", activeExams);
//           setAllExams(activeExams);
//         }

//         // Fetch trust bar items
//         const trustBarRes = await fetch(`${API_BASE_URL}/api/home/exams-trust-bar/`);
//         const trustBarData = await trustBarRes.json();
//         if (trustBarData.success) {
//           setTrustBarItems(trustBarData.data || []);
//         }

//         // Fetch about section
//         const aboutRes = await fetch(`${API_BASE_URL}/api/home/exams-about/`);
//         const aboutData = await aboutRes.json();
//         if (aboutData.success) {
//           setAboutSection(aboutData.data);
//         }
//       } catch (err) {
//         console.error("Error fetching data:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchData();
//   }, []);

//   const handleSearch = () => {
//     // State is already updated from search bar inputs
//     // Just update the URL to reflect current filters
//     // The filteredExams useMemo will automatically update when state changes
//     updateURL(selectedProviders, selectedCategories, searchKeyword);
    
//     // Scroll to results section
//     setTimeout(() => {
//       const resultsSection = document.getElementById('results-section');
//       if (resultsSection) {
//         // Use requestAnimationFrame to avoid forced reflow
//         requestAnimationFrame(() => {
//           resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
//         });
//       }
//     }, 100);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") {
//       handleSearch();
//     }
//   };

//   const filteredExams = useMemo(() => {
//     return allExams.filter((exam) => {
//       // Filter by providers (multiple selection with checkboxes)
//       if (selectedProviders.length > 0) {
//         const examProvider = exam.provider?.toLowerCase();
//         const matchesProvider = selectedProviders.some(providerSlug => {
//           const providerName = providers.find((p) => p.slug === providerSlug)?.name || providerSlug;
//           return examProvider === providerName.toLowerCase();
//         });
//         if (!matchesProvider) {
//           return false;
//         }
//       }

//       // Filter by categories (multiple selection with checkboxes)
//       if (selectedCategories.length > 0) {
//         const examCategory = exam.category?.toLowerCase();
//         const matchesCategory = selectedCategories.some(catSlug => {
//           const categoryName = categories.find((c) => c.slug === catSlug)?.name || catSlug;
//           return examCategory === categoryName.toLowerCase();
//         });
//         if (!matchesCategory) {
//           return false;
//         }
//       }

//       // Filter by search keyword
//       if (searchKeyword) {
//         const q = searchKeyword.toLowerCase();
//         const title = exam.title?.toLowerCase() || "";
//         const code = exam.code?.toLowerCase() || "";
//         const provider = exam.provider?.toLowerCase() || "";
//         if (!title.includes(q) && !code.includes(q) && !provider.includes(q)) {
//           return false;
//         }
//       }

//       // Filter by minimum questions
//       if (exam.questions < minQuestions) {
//         return false;
//       }

//       return true;
//     });
//   }, [selectedProviders, selectedCategories, searchKeyword, minQuestions, providers, categories, allExams]);

//   const totalQuestions = filteredExams.reduce((sum, exam) => sum + (exam.questions || 0), 0);
//   const updatedThisWeek = filteredExams.length; // All are considered recent

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
//           <p className="text-[#0C1A35]/70">{t("common.loading_exams")}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white">

//       {/* SEARCH BAR SECTION - Exact Design Match */}
//       <section className="bg-[#0C1A35] pt-12 pb-20 relative overflow-hidden">
//         {/* Curved white shape at bottom */}
//         <div className="absolute bottom-0 left-0 right-0 h-20 bg-white rounded-t-[4rem]"></div>
        
//         <div className="container mx-auto px-4 max-w-5xl relative z-10">
//           {/* Semi-transparent dark blue container with rounded corners and shadow */}
//           <div className="bg-[#0C1A35]/80 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 p-5">
//             <div className="flex flex-col md:flex-row gap-3 items-stretch">
//               {/* Dropdown - Left side */}
//               <Select 
//                 value={selectedProviders.length > 0 ? selectedProviders[0] : "all"} 
//                 onValueChange={(value) => {
//                   const newProviders = value === "all" ? [] : [value];
//                   setSelectedProviders(newProviders);
                  
//                   // Update URL immediately
//                   if (!isInitializing.current) {
//                     updateURL(newProviders, selectedCategories, searchKeyword);
//                   }
//                 }}
//               >
//                 <SelectTrigger className="w-full md:w-[200px] bg-gray-100 border-0 h-12 text-sm text-gray-700 font-medium rounded-lg min-h-12">
//                   <SelectValue placeholder="All Providers" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Providers</SelectItem>
//                   {providers.map((provider) => (
//                     <SelectItem key={provider.id} value={provider.slug}>
//                       {provider.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               {/* Search Input - Middle */}
//               <div className="flex-1 relative">
//                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A73E8] z-10" />
//                 <Input
//                   placeholder={t("exams.page.search_placeholder")}
//                   className="pl-12 pr-4 bg-gray-100 border-0 h-12 text-sm text-gray-700 placeholder:text-gray-400 rounded-lg min-h-12"
//                   value={searchKeyword}
//                   onChange={(e) => setSearchKeyword(e.target.value)}
//                   onKeyPress={handleKeyPress}
//                 />
//               </div>

//               {/* Search Button - Right side */}
//               <Button
//                 onClick={handleSearch}
//                 className="bg-[#1A73E8] text-white hover:bg-[#1557B0] w-full md:w-auto px-8 h-12 text-sm font-medium rounded-lg shadow-lg transition-all min-h-12"
//               >
//                 {t("home.search.button")}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* MAIN CONTENT */}
//       <section id="results-section" className="py-8 px-4 bg-white -mt-8">
//         <div className="container mx-auto max-w-7xl">
//           {/* Results Header */}
//           <div className="mb-6">
//             <h1 className="text-3xl font-bold text-[#0C1A35] mb-2">
//               Showing {filteredExams.length} results for All Popular Exams
//             </h1>
//             <div className="flex flex-wrap gap-4 text-sm text-[#0C1A35]/70">
//               <span>{updatedThisWeek} exams updated this week</span>
//               <span>•</span>
//               <span>{totalQuestions.toLocaleString()}+ questions available</span>
//             </div>
//           </div>

//           {/* Trust Bar - Dynamic from Admin */}
//           {trustBarItems.length > 0 && (
//             <Card className="p-4 mb-6 border border-gray-200 bg-white shadow-sm">
//               <div className={`grid grid-cols-2 md:grid-cols-${Math.min(trustBarItems.length, 4)} gap-4 text-center`}>
//                 {trustBarItems.map((item, index) => {
//                   // Map icon names to components
//                   const IconComponent = {
//                     CheckCircle2,
//                     Clock,
//                     Users,
//                     BarChart3,
//                     TrendingUp,
//                     Star,
//                     Sparkles,
//                   }[item.icon] || CheckCircle2;

//                   return (
//                     <div key={index} className="flex flex-col items-center gap-2">
//                       <IconComponent className="w-5 h-5 text-[#1A73E8]" />
//                       <div>
//                         <div className="font-semibold text-[#0C1A35]">{item.label}</div>
//                         <div className="text-xs text-[#0C1A35]/60">{item.description}</div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </Card>
//           )}

//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//             {/* LEFT FILTERS */}
//             <div className="lg:col-span-1">
//               <Card className="p-6 bg-white border border-gray-200 shadow-sm">
//                 <h3 className="text-lg font-semibold text-[#0C1A35] mb-6">{t("common.filters")}</h3>

//                 {/* Providers - Using Checkboxes */}
//                 <div className="mb-6">
//                   <Label className="text-[#0C1A35] font-medium mb-3 block text-sm">Providers</Label>
//                   <div className="space-y-2.5 max-h-[200px] overflow-y-auto">
//                     {providers.length > 0 ? (
//                       providers.map((provider) => (
//                         <div key={provider.id || provider.slug} className="flex items-center space-x-2.5">
//                           <Checkbox 
//                             id={`provider-${provider.slug}`}
//                             checked={selectedProviders.includes(provider.slug)}
//                             onCheckedChange={() => handleProviderToggle(provider.slug)}
//                             className="border-gray-300"
//                           />
//                           <Label 
//                             htmlFor={`provider-${provider.slug}`} 
//                             className="text-sm text-[#0C1A35] cursor-pointer font-normal"
//                           >
//                             {provider.name}
//                           </Label>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="text-sm text-gray-500 py-2">
//                         No providers available.
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Categories - Using Checkboxes */}
//                 <div className="mb-6">
//                   <Label className="text-[#0C1A35] font-medium mb-3 block text-sm">Categories</Label>
//                   <div className="space-y-2.5 max-h-[200px] overflow-y-auto">
//                     {categories.length > 0 ? (
//                       categories.map((cat) => (
//                         <div key={cat.id || cat.slug} className="flex items-center space-x-2.5">
//                           <Checkbox 
//                             id={cat.slug}
//                             checked={selectedCategories.includes(cat.slug)}
//                             onCheckedChange={() => handleCategoryToggle(cat.slug)}
//                             className="border-gray-300"
//                           />
//                           <Label 
//                             htmlFor={cat.slug} 
//                             className="text-sm text-[#0C1A35] cursor-pointer font-normal"
//                           >
//                             {cat.name}
//                           </Label>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="text-sm text-gray-500 py-2">
//                         {t("categories.admin_empty_hint")}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Updated */}
//                 <div className="mb-6">
//                   <Label className="text-[#0C1A35] font-medium mb-3 block text-sm">Updated</Label>
//                   <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
//                     <SelectTrigger className="bg-white border-gray-300 h-10 text-sm">
//                       <SelectValue placeholder="All time" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All time</SelectItem>
//                       <SelectItem value="week">This week</SelectItem>
//                       <SelectItem value="month">This month</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Minimum Questions */}
//                 <div>
//                   <Label className="text-[#0C1A35] font-medium mb-3 block text-sm">{t("common.minimum_questions")}</Label>
//                   <Input
//                     type="number"
//                     value={minQuestions}
//                     onChange={(e) => setMinQuestions(Number(e.target.value) || 0)}
//                     className="bg-white border-gray-300 h-10 text-sm"
//                     placeholder="0"
//                   />
//                 </div>
//               </Card>
//             </div>

//             {/* EXAM GRID */}
//             <div className="lg:col-span-3">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {filteredExams.map((exam) => (
//                   <Card
//                     key={exam.id}
//                     className="p-6 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all bg-white shadow-sm"
//                   >
//                     <div className="flex gap-2 mb-3">
//                       <Badge variant="secondary" className="bg-gray-100 text-[#0C1A35] border-0 text-xs font-medium">
//                         {exam.provider}
//                       </Badge>
//                       {exam.category && (
//                         <Badge variant="secondary" className="bg-gray-100 text-[#0C1A35] border-0 text-xs font-medium">
//                           {exam.category}
//                         </Badge>
//                       )}
//                     </div>

//                     <h3 className="text-xl font-bold text-[#0C1A35] mb-1">{exam.title || exam.name}</h3>
//                     <p className="text-sm text-[#0C1A35]/60 mb-3">{exam.code}</p>

//                     <div className="flex gap-2 mb-3 flex-wrap">
//                       {exam.badge && (
//                         <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0 text-xs">
//                           {exam.badge}
//                         </Badge>
//                       )}
//                     </div>

//                     <p className="text-sm text-[#0C1A35]/70 mb-4">
//                       {(() => {
//                         // Use actual count from practice_tests_list if available
//                         if (exam.practice_tests_list && Array.isArray(exam.practice_tests_list) && exam.practice_tests_list.length > 0) {
//                           return exam.practice_tests_list.length;
//                         }
//                         return exam.practice_exams || 0;
//                       })()} Practice Exams · {(() => {
//                         // Calculate total questions from practice tests list if available
//                         if (exam.practice_tests_list && Array.isArray(exam.practice_tests_list) && exam.practice_tests_list.length > 0) {
//                           const totalQuestions = exam.practice_tests_list.reduce((sum, test) => {
//                             const testQuestions = parseInt(test.questions) || 0;
//                             return sum + testQuestions;
//                           }, 0);
//                           return totalQuestions > 0 ? totalQuestions : (exam.questions || 0);
//                         }
//                         return exam.questions || 0;
//                       })()} Questions
//                     </p>

//                     <Button
//                       className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0] h-10 rounded-lg font-medium"
//                       asChild
//                     >
//                       <Link href={getExamUrl(exam)}>
//                         {t("home.featured.start_practicing")}
//                         <ArrowRight className="ml-2 w-4 h-4" />
//                       </Link>
//                     </Button>
//                   </Card>
//                 ))}
//               </div>

//               {filteredExams.length === 0 && (
//                 <Card className="p-10 text-center border border-gray-200 bg-white shadow-sm">
//                   <h3 className="text-xl font-semibold text-[#0C1A35] mb-2">No exams found</h3>
//                   <p className="text-sm text-[#0C1A35]/70 mb-4">
//                     Try adjusting your filters or search criteria
//                   </p>
//                   <Button
//                     onClick={() => {
//                       setSearchKeyword("");
//                       setSelectedProviders([]);
//                       setSelectedCategories([]);
//                       setMinQuestions(0);
//                       updateURL([], [], "");
//                     }}
//                     className="bg-[#1A73E8] text-white hover:bg-[#1557B0] rounded-lg"
//                   >
//                     {t("common.reset_filters")}
//                   </Button>
//                 </Card>
//               )}
//             </div>
//           </div>

//           {/* About Section - Dynamic from Admin */}
//           {aboutSection.content && (
//             <section className="mt-12 mb-8">
//               <Card className="p-8 border border-gray-200 bg-white shadow-sm">
//                 <div 
//                   className="text-[#0C1A35] mb-4"
//                   dangerouslySetInnerHTML={{ 
//                     __html: aboutSection.heading || "<h2 class=\"text-2xl font-bold\">About All Popular Exams Preparation</h2>"
//                   }}
//                 />
//                 <div 
//                   className="space-y-4 text-[#0C1A35]/80 leading-relaxed tiptap-editor-content"
//                   dangerouslySetInnerHTML={{ __html: aboutSection.content }}
//                 />
//               </Card>
//             </section>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }




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
import ListPagination, {
  DEFAULT_LIST_PAGE_SIZE,
  getListPaginationSlice,
} from "@/components/common/ListPagination";
import { t, tf } from "@/lib/uiStrings";
import EntityText, {
  CourseTitleText,
  ProviderNameText,
} from "@/components/common/EntityText";
import TipTapContent from "@/components/editor/TipTapContent";
import { filterPublicExamListings } from "@/lib/examListingFilters";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function getTrustBarGridClass(count) {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count === 3) return "grid-cols-1 sm:grid-cols-3";
  return "grid-cols-2 lg:grid-cols-4";
}

/** Trust bar: distinct color theme per item (cycles if more than 4) */
const TRUST_BAR_ACCENTS = [
  {
    cell: "bg-gradient-to-br from-[#EFF6FF] via-[#F5F9FF] to-[#FAFCFF]",
    iconWrap: "bg-gradient-to-br from-[#1A73E8] to-[#1557B0] shadow-lg shadow-blue-500/30",
    iconColor: "text-white",
    label: "text-[#1557B0]",
  },
  {
    cell: "bg-gradient-to-br from-[#EEF2FF] via-[#F5F3FF] to-[#FAFAFF]",
    iconWrap: "bg-gradient-to-br from-[#4F46E5] to-[#6366F1] shadow-lg shadow-indigo-500/30",
    iconColor: "text-white",
    label: "text-[#4338CA]",
  },
  {
    cell: "bg-gradient-to-br from-[#ECFDF5] via-[#F0FDF9] to-[#F8FFFE]",
    iconWrap: "bg-gradient-to-br from-[#059669] to-[#10B981] shadow-lg shadow-emerald-500/30",
    iconColor: "text-white",
    label: "text-[#047857]",
  },
  {
    cell: "bg-gradient-to-br from-[#F5F3FF] via-[#FAF5FF] to-[#FDFCFF]",
    iconWrap: "bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] shadow-lg shadow-violet-500/30",
    iconColor: "text-white",
    label: "text-[#6D28D9]",
  },
  {
    cell: "bg-gradient-to-br from-[#F0F9FF] via-[#F8FCFF] to-white",
    iconWrap: "bg-gradient-to-br from-[#0284C7] to-[#0EA5E9] shadow-lg shadow-sky-500/30",
    iconColor: "text-white",
    label: "text-[#0369A1]",
  },
  {
    cell: "bg-gradient-to-br from-[#FFF7ED] via-[#FFFBEB] to-white",
    iconWrap: "bg-gradient-to-br from-[#C2410C] to-[#EA580C] shadow-lg shadow-orange-500/25",
    iconColor: "text-white",
    label: "text-[#C2410C]",
  },
];

const PROVIDER_BADGE_CLASS =
  "border border-[#93B8E8] bg-gradient-to-r from-[#E8F1FD] to-[#F4F9FF] text-[#1557B0] text-xs font-semibold shadow-sm hover:from-[#D6E8FA] hover:to-[#E8F1FD] hover:text-[#1A73E8] hover:border-[#1A73E8]/40 transition-all";

const CATEGORY_BADGE_CLASS =
  "border border-[#B8C8E0] bg-gradient-to-r from-[#EEF2F9] to-[#F8FAFD] text-[#0C1A35] text-xs font-semibold shadow-sm hover:from-[#E2E9F5] hover:to-[#EEF2F9] hover:text-[#1A73E8] hover:border-[#1A73E8]/30 transition-all";

export default function ExamsPageContent({
  initialProvider = [],
  initialKeyword = "",
  initialProvidersData = [],
  initialCategoriesData = [],
  initialExamsData = [],
  initialTrustBarData = [],
  initialAboutData = {},
  initialPageHeading = "All Popular Exams",
  showBrowseLinks = false,
  linksOnly = false,
  usePathBasedRouting = false,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
  const [selectedProviders, setSelectedProviders] = useState(initialProvider);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [minQuestions, setMinQuestions] = useState(0);
  const [providers, setProviders] = useState(initialProvidersData);
  const [categories, setCategories] = useState(initialCategoriesData);
  const [allExams, setAllExams] = useState(
    filterPublicExamListings(initialExamsData)
  );
  const [trustBarItems, setTrustBarItems] = useState(initialTrustBarData);
  const [aboutSection, setAboutSection] = useState(initialAboutData);
  const [pageHeading] = useState(initialPageHeading);
  const [loading, setLoading] = useState(false);
  const [listPage, setListPage] = useState(1);
  const isInitializing = useRef(true);
  const hasInitialized = useRef(false);

  // Helper function to build SEO-friendly URL
  const buildSEOUrl = (newProviders, newCategories, newKeyword) => {
    if (usePathBasedRouting) {
      // Provider listing uses root slug (/provider); global keyword search stays under /exams/search/...
      if (newProviders.length > 0 && newKeyword && newKeyword.trim()) {
        const provider = newProviders[0];
        const keyword = encodeURIComponent(createSlug(newKeyword.trim()));
        return `/${provider}/search/${keyword}`;
      } else if (newProviders.length > 0) {
        return `/${newProviders[0]}`;
      } else if (newKeyword && newKeyword.trim()) {
        const keyword = encodeURIComponent(createSlug(newKeyword.trim()));
        return `/exams/search/${keyword}`;
      } else {
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
    // Keep users on /exams page while filtering; do not route to provider/exam pages.
    if (usePathBasedRouting) {
      return;
    }
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

  const pageLastUpdatedLabel = useMemo(() => {
    const parse = (v) => {
      if (!v) return null;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    const bestDate = (allExams || []).reduce(
      (best, exam) => {
        const d = parse(exam?.updated_at || exam?.updatedAt || exam?.updated);
        if (!d) return best;
        return !best || d > best ? d : best;
      },
      null
    );
    if (!bestDate) return null;
    const month = bestDate.toLocaleString("en-US", { month: "short" });
    // return `Last updated: ${month}, ${bestDate.getDate()} ${bestDate.getFullYear()}`;
  }, [allExams]);

  /** Normalize provider display names so EC-Council (ASCII hyphen) matches EC–Council (unicode dash) for filtering. */
  const normalizeProviderNameKey = (name) => {
    if (!name) return "";
    return name
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
      .replace(/\s+/g, " ");
  };

  /** Canonical slug for an exam row — must stay in sync with checkbox values (provider.slug from API). */
  const getExamProviderSlugForFilter = (exam) => {
    if (exam?.provider_slug) {
      return String(exam.provider_slug).toLowerCase().trim();
    }
    const examKey = normalizeProviderNameKey(exam?.provider || "");
    const match = providers.find(
      (p) => normalizeProviderNameKey(p?.name) === examKey
    );
    if (match?.slug) return String(match.slug).toLowerCase().trim();
    return createSlug(normalizeProviderNameKey(exam?.provider || "").replace(/ /g, "-"));
  };

  const getProviderPageUrl = (exam) => {
    const providerName = exam?.provider?.toLowerCase?.().trim?.() || "";
    const canonicalProvider = providers.find(
      (provider) => provider?.name?.toLowerCase?.().trim?.() === providerName
    );
    const providerSlug =
      canonicalProvider?.slug || exam?.provider_slug || createSlug(exam?.provider || "");
    return `/providers/${providerSlug}`;
  };

  const getCategoryPageUrl = (exam) => {
    const categoryName = exam?.category?.toLowerCase?.().trim?.() || "";
    const canonicalCategory = categories.find(
      (category) => category?.name?.toLowerCase?.().trim?.() === categoryName
    );
    const categorySlug =
      canonicalCategory?.slug || exam?.category_slug || createSlug(exam?.category || "");
    return `/categories/${categorySlug}`;
  };

  const categoryLinkItems = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories
      .map((category) => {
        const label = category?.name || category?.title || "";
        const slug = category?.slug || createSlug(label);
        return {
          label: String(label || "").trim(),
          href: `/categories/${slug}`,
        };
      })
      .filter((item) => item.label && item.href !== "/categories/")
      .slice(0, 40);
  }, [categories]);

  const examLinkItems = useMemo(() => {
    if (!Array.isArray(allExams)) return [];
    const seen = new Set();
    const links = [];

    for (const exam of allExams) {
      const label = exam?.title || exam?.name || exam?.code || "";
      const href = getExamUrl(exam);
      if (!label || !href || href === "#") continue;

      const key = `${String(label).toLowerCase()}::${href}`;
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ label, href });
      if (links.length >= 60) break;
    }

    return links;
  }, [allExams]);

  // const filteredExams = useMemo(() => {
  //   return allExams.filter((exam) => {
  //     // Filter by providers (multiple selection with checkboxes)
  //     if (selectedProviders.length > 0) {
  //       const examProvider = exam.provider?.toLowerCase();
  //       const matchesProvider = selectedProviders.some(providerSlug => {
  //         const providerName = providers.find((p) => p.slug === providerSlug)?.name || providerSlug;
  //         return examProvider === providerName.toLowerCase();
  //       });
  //       if (!matchesProvider) {
  //         return false;
  //       }
  //     }

  //     // Filter by categories (multiple selection with checkboxes)
  //     if (selectedCategories.length > 0) {
  //       const examCategory = exam.category?.toLowerCase();
  //       const matchesCategory = selectedCategories.some(catSlug => {
  //         const categoryName = categories.find((c) => c.slug === catSlug)?.name || catSlug;
  //         return examCategory === categoryName.toLowerCase();
  //       });
  //       if (!matchesCategory) {
  //         return false;
  //       }
  //     }

  //     // Filter by search keyword
  //     if (searchKeyword) {
  //       const q = searchKeyword.toLowerCase();
  //       const title = exam.title?.toLowerCase() || "";
  //       const code = exam.code?.toLowerCase() || "";
  //       const provider = exam.provider?.toLowerCase() || "";
  //       if (!title.includes(q) && !code.includes(q) && !provider.includes(q)) {
  //         return false;
  //       }
  //     }

  //     // Filter by minimum questions
  //     if (exam.questions < minQuestions) {
  //       return false;
  //     }

  //     return true;
  //   });
  // }, [selectedProviders, selectedCategories, searchKeyword, minQuestions, providers, categories, allExams]);


  // const filteredExams = useMemo(() => {
  //   const q = searchKeyword?.trim().toLowerCase() || "";
  
  //   return allExams.filter((exam) => {
  //     // Filter by providers
  //     // if (selectedProviders.length > 0) {
  //     //   const examProviderSlug = providers.find(
  //     //     p => p.name.toLowerCase() === (exam.provider || "").toLowerCase()
  //     //   )?.slug;
  //     //   if (!selectedProviders.includes(examProviderSlug)) return false;
  //     // }

  //     if (selectedCategories.length > 0) {
  //       const examCategorySlug = createSlug(exam.category || "");
  //       if (!selectedCategories.includes(examCategorySlug)) return false;
  //     }
  
  //     // Filter by categories
  //     // if (selectedCategories.length > 0) {
  //     //   const examCategorySlug = categories.find(
  //     //     c => c.name.toLowerCase() === (exam.category || "").toLowerCase()
  //     //   )?.slug;
  //     //   if (!selectedCategories.includes(examCategorySlug)) return false;
  //     // }


  //     if (selectedCategories.length > 0) {
  //       const examCategorySlug = createSlug(exam.category || "");
  //       if (!selectedCategories.includes(examCategorySlug)) return false;
  //     }
  
  //     // Filter by keyword
  //     if (q) {
  //       const title = (exam.title || exam.name || "").toLowerCase();
  //       const code = (exam.code || "").toLowerCase();
  //       const provider = (exam.provider || "").toLowerCase();
  //       if (!title.includes(q) && !code.includes(q) && !provider.includes(q)) return false;
  //     }
  
  //     // Filter by minimum questions
  //     if (exam.questions < minQuestions) return false;
  
  //     return true;
  //   });
  // }, [allExams, selectedProviders, selectedCategories, searchKeyword, minQuestions, providers, categories]);
  // const totalQuestions = filteredExams.reduce((sum, exam) => sum + (exam.questions || 0), 0);
  // const updatedThisWeek = filteredExams.length; // All are considered recent

  const filteredExams = useMemo(() => {
    const q = searchKeyword?.trim().toLowerCase() || "";
    const selectedProviderKeys = selectedProviders.map((s) =>
      String(s || "").toLowerCase().trim()
    );
  
    return allExams.filter((exam) => {
  
      // Provider filter: use API provider_slug / name lookup — not createSlug(provider) alone (breaks EC-Council vs unicode dashes).
      if (selectedProviderKeys.length > 0) {
        const examProviderSlug = getExamProviderSlugForFilter(exam);
        if (!examProviderSlug || !selectedProviderKeys.includes(examProviderSlug)) {
          return false;
        }
      }
  
      // ✅ Category filter
      if (selectedCategories.length > 0) {
        const examCategorySlug = createSlug(exam.category || "");
        if (!selectedCategories.includes(examCategorySlug)) {
          return false;
        }
      }
  
      // ✅ Keyword filter
      if (q) {
        const title = (exam.title || exam.name || "").toLowerCase();
        const code = (exam.code || "").toLowerCase();
        const provider = (exam.provider || "").toLowerCase();
  
        if (
          !title.includes(q) &&
          !code.includes(q) &&
          !provider.includes(q)
        ) {
          return false;
        }
      }
  
      // ✅ Min questions
      if ((exam.questions || 0) < minQuestions) {
        return false;
      }
  
      return true;
    });
  }, [
    allExams,
    selectedProviders,
    selectedCategories,
    searchKeyword,
    minQuestions,
    providers,
  ]);
  // ✅ ADD THESE BACK
  const totalQuestions = filteredExams.reduce(
    (sum, exam) => sum + (exam.questions || 0),
    0
  );

  const updatedThisWeek = filteredExams.length;

  const examPagination = useMemo(
    () => getListPaginationSlice(filteredExams, listPage, DEFAULT_LIST_PAGE_SIZE),
    [filteredExams, listPage]
  );

  useEffect(() => {
    setListPage(1);
  }, [searchKeyword, selectedProviders, selectedCategories, minQuestions, selectedTimeframe]);

  useEffect(() => {
    if (listPage > examPagination.totalPages) {
      setListPage(examPagination.totalPages);
    }
  }, [examPagination.totalPages, listPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
          <p className="text-[#0C1A35]/70">{t("common.loading_exams")}</p>
        </div>
      </div>
    );
  }

  if (linksOnly) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F9FF] via-white to-white">
        <section className="px-4 pt-8 pb-12 md:pt-12 md:pb-16">
          <div className="container mx-auto max-w-7xl">
            <div className="mb-8 md:mb-10 rounded-2xl border border-[#DDE7FF] bg-white p-6 md:p-8 shadow-sm">
              <h1 className="text-3xl md:text-4xl font-bold text-[#0C1A35] mb-3">
                {(pageHeading && String(pageHeading).trim()) || t("common.all_popular_exams")}
              </h1>
              <p className="text-sm md:text-base text-[#0C1A35]/70 max-w-3xl">
                {t("common.explore_links_intro")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-[#DDE7FF] bg-white shadow-sm overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-[#E8EEFF] bg-[#F8FBFF]">
                  <h2 className="text-xl font-semibold text-[#0C1A35]">{t("common.categories")}</h2>
                  <p className="text-xs text-[#0C1A35]/60 mt-1">
                    {tf("common.available", { count: categoryLinkItems.length })}
                  </p>
                </div>
                <div className="p-5 md:p-6">
                {categoryLinkItems.length > 0 ? (
                  <div className="space-y-2">
                    {categoryLinkItems.map((item) => (
                      <Link
                        key={`${item.href}-${item.label}`}
                        href={item.href}
                        className="block w-full rounded-md border border-[#CFE0FF] bg-[#F5F9FF] px-3 py-2 text-sm text-[#1557B0] underline underline-offset-2 hover:bg-[#EAF2FF] hover:border-[#BBD3FF] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#0C1A35]/60">{t("common.no_categories")}</p>
                )}
                </div>
              </Card>

              <Card className="border border-[#DDE7FF] bg-white shadow-sm overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-[#E8EEFF] bg-[#F8FBFF]">
                  <h2 className="text-xl font-semibold text-[#0C1A35]">{t("common.popular_exams")}</h2>
                  <p className="text-xs text-[#0C1A35]/60 mt-1">
                    {tf("common.available", { count: examLinkItems.length })}
                  </p>
                </div>
                <div className="p-5 md:p-6">
                {examLinkItems.length > 0 ? (
                  <div className="space-y-2">
                    {examLinkItems.map((item) => (
                      <Link
                        key={`${item.href}-${item.label}`}
                        href={item.href}
                        className="block w-full rounded-md border border-[#CFE0FF] bg-[#F5F9FF] px-3 py-2 text-sm text-[#1557B0] underline underline-offset-2 hover:bg-[#EAF2FF] hover:border-[#BBD3FF] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#0C1A35]/60">{t("common.no_exams")}</p>
                )}
                </div>
              </Card>
            </div>
          </div>
        </section>
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
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-6">
            {(pageHeading && String(pageHeading).trim()) || t("common.all_popular_exams")}
          </h1>
          {pageLastUpdatedLabel ? (
            <p className="-mt-3 mb-6 text-center text-sm text-white/80">
              {pageLastUpdatedLabel}
            </p>
          ) : null}
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
                  <SelectValue placeholder={t("common.all_providers")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all_providers")}</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.slug}>
                      <ProviderNameText provider={provider} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search Input - Middle */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A73E8] z-10" />
                <Input
                  placeholder={t("exams.page.search_placeholder")}
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
                {t("home.search.button")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section id="results-section" className="py-8 px-4 bg-gradient-to-b from-[#F5F8FC] via-white to-white -mt-8">
        <div className="container mx-auto max-w-7xl">
          {showBrowseLinks && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="p-5 md:p-6 border border-[#DDE7FF] bg-white shadow-sm">
                <h2 className="text-xl font-semibold text-[#0C1A35] mb-3">
                  Categories
                </h2>
                {categoryLinkItems.length > 0 ? (
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {categoryLinkItems.map((item) => (
                      <Link
                        key={`${item.href}-${item.label}`}
                        href={item.href}
                        className="text-sm text-[#1A73E8] hover:text-[#1557B0] underline-offset-2 hover:underline"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#0C1A35]/60">{t("common.no_categories")}</p>
                )}
              </Card>

              <Card className="p-5 md:p-6 border border-[#DDE7FF] bg-white shadow-sm">
                <h2 className="text-xl font-semibold text-[#0C1A35] mb-3">
                  Popular Exams
                </h2>
                {examLinkItems.length > 0 ? (
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {examLinkItems.map((item) => (
                      <Link
                        key={`${item.href}-${item.label}`}
                        href={item.href}
                        className="text-sm text-[#1A73E8] hover:text-[#1557B0] underline-offset-2 hover:underline"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#0C1A35]/60">{t("common.no_exams")}</p>
                )}
              </Card>
            </div>
          )}

          {/* Intro Section */}
          <Card className="p-5 md:p-6 mb-6 border border-[#DDE7FF] bg-gradient-to-br from-[#F8FBFF] via-white to-[#F0F4FF] shadow-sm ring-1 ring-[#1A73E8]/5">
            {aboutSection?.heading ? (
              <div
                className="text-[#0C1A35] mb-2"
                dangerouslySetInnerHTML={{ __html: aboutSection.heading }}
              />
            ) : (
              <h2 className="text-lg md:text-xl font-semibold text-[#0C1A35] mb-2">
                Find the right exam quickly
              </h2>
            )}

            {aboutSection?.content ? (
              <TipTapContent
                content={aboutSection.content}
                className="text-sm md:text-base text-[#0C1A35]/75 leading-relaxed"
              />
            ) : (
              <p className="text-sm md:text-base text-[#0C1A35]/75 leading-relaxed">
                Use the provider dropdown, keyword search, and filters to discover the best exam
                practice tests for your preparation. Open any exam card to view full details and
                start practicing.
              </p>
            )}
          </Card>

          {/* Results Header */}
          <div className="mb-6">
            <p className="text-3xl font-bold text-[#0C1A35] mb-2">
              Showing {filteredExams.length} results 
            </p>
            {/* <div className="flex flex-wrap gap-4 text-sm text-[#0C1A35]/70"> */}
              {/* <span>{updatedThisWeek} exams updated this week</span> */}
              {/* <span>•</span> */}
              {/* <span>{totalQuestions.toLocaleString()}+ questions available</span> */}
            {/* </div> */}
          </div>

          {/* Trust Bar - Dynamic from Admin */}
          {trustBarItems.length > 0 && (
            <Card className="mb-6 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-md">
              <div
                className={`grid ${getTrustBarGridClass(trustBarItems.length)}`}
              >
                {trustBarItems.map((item, index) => {
                  const IconComponent = {
                    CheckCircle2,
                    Clock,
                    Users,
                    BarChart3,
                    TrendingUp,
                    Star,
                    Sparkles,
                  }[item.icon] || CheckCircle2;
                  const accent =
                    TRUST_BAR_ACCENTS[index % TRUST_BAR_ACCENTS.length];

                  return (
                    <div
                      key={index}
                      className={`flex flex-col items-center gap-3 px-4 py-7 text-center transition-colors ${accent.cell}`}
                    >
                      <div
                        className={`flex h-[52px] w-[52px] items-center justify-center rounded-2xl ${accent.iconWrap}`}
                      >
                        <IconComponent className={`h-6 w-6 ${accent.iconColor}`} />
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${accent.label}`}>
                          {item.label}
                        </div>
                        {item.description ? (
                          <div className="mt-1 text-xs leading-relaxed text-[#0C1A35]/60">
                            {item.description}
                          </div>
                        ) : null}
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
              <div className="sticky top-24">
              <Card className="p-6 bg-gradient-to-b from-white to-[#F8FBFF] border border-[#DDE7FF] shadow-sm ring-1 ring-[#1A73E8]/5">
                <h3 className="text-lg font-semibold text-[#0C1A35] mb-6">{t("common.filters")}</h3>

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
                            <ProviderNameText provider={provider} />
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
                        {t("categories.admin_empty_hint")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Updated */}
                <div className="mb-6">
                  <Label className="text-[#0C1A35] font-medium mb-3 block text-sm">Updated</Label>
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="bg-white border-gray-300 h-10 text-sm">
                      <SelectValue placeholder={t("common.all_time")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("common.all_time")}</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Minimum Questions */}
                {/* <div>
                  <Label className="text-[#0C1A35] font-medium mb-3 block text-sm">{t("common.minimum_questions")}</Label>
                  <Input
                    type="number"
                    value={minQuestions}
                    onChange={(e) => setMinQuestions(Number(e.target.value) || 0)}
                    className="bg-white border-gray-300 h-10 text-sm"
                    placeholder="0"
                  />
                </div> */}
              </Card>
              </div>
            </div>

            {/* EXAM GRID */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {examPagination.items.map((exam) => (
                  <Card
                    key={exam.id}
                    className="group relative overflow-hidden p-6 border border-[#DDE7FF] bg-white hover:shadow-xl hover:shadow-[#1A73E8]/10 hover:-translate-y-1 hover:border-[#1A73E8]/35 transition-all h-full flex flex-col ring-1 ring-transparent hover:ring-[#1A73E8]/10"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1A73E8] via-[#4A90D9] to-[#1557B0] opacity-80"
                      aria-hidden
                    />
                    <div className="flex flex-wrap gap-2 mb-3 pt-1">
                      <Link
                        href={getProviderPageUrl(exam)}
                        className="inline-flex"
                      >
                        <Badge
                          variant="secondary"
                          className={PROVIDER_BADGE_CLASS}
                        >
                          <EntityText text={exam.provider} />
                        </Badge>
                      </Link>
                      {exam.category && (
                        <Link
                          href={getCategoryPageUrl(exam)}
                          className="inline-flex"
                        >
                          <Badge
                            variant="secondary"
                            className={CATEGORY_BADGE_CLASS}
                          >
                            <EntityText text={exam.category} />
                          </Badge>
                        </Link>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-[#0C1A35] mb-1">
                      <Link
                        href={getExamUrl(exam)}
                        className="hover:text-[#1A73E8] transition-colors"
                        aria-label={`Open ${exam.title || exam.name || "exam"} details`}
                      >
                        <CourseTitleText course={exam} />
                      </Link>
                    </h3>
                    <p className="text-sm text-[#0C1A35]/60 mb-3">
                      <Link
                        href={getExamUrl(exam)}
                        className="hover:text-[#1A73E8] transition-colors"
                        aria-label={`Open ${exam.title || exam.name || "exam"} by code`}
                      >
                        {exam.code}
                      </Link>
                    </p>

                    <div className="flex gap-2 mb-3 flex-wrap">
                      {exam.badge && (
                        <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] border-0 text-xs">
                          {exam.badge}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-[#0C1A35]/70 mb-4 rounded-lg bg-[#F5F8FC] border border-[#DDE7FF]/60 px-3 py-2">
                      {(() => {
                        // Use actual count from practice_tests_list if available
                        if (exam.practice_tests_list && Array.isArray(exam.practice_tests_list) && exam.practice_tests_list.length > 0) {
                          return exam.practice_tests_list.length;
                        }
                        return exam.practice_exams || 0;
                      })()} Practice Exams · {(() => {
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
                      className="w-full mt-auto bg-gradient-to-r from-[#1A73E8] to-[#1557B0] text-white hover:from-[#1557B0] hover:to-[#0C1A35] h-10 rounded-lg font-medium shadow-md shadow-[#1A73E8]/20"
                      asChild
                    >
                      <Link href={getExamUrl(exam)}>
                        {t("home.featured.start_practicing")}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </Card>
                ))}
              </div>

              <ListPagination
                currentPage={examPagination.page}
                totalPages={examPagination.totalPages}
                onPageChange={setListPage}
                totalItems={examPagination.totalItems}
                pageSize={DEFAULT_LIST_PAGE_SIZE}
                itemLabelKey="pagination.exams"
                scrollTargetId="results-section"
              />

              {filteredExams.length === 0 && (
                <Card className="p-10 text-center border border-[#DDE7FF] bg-gradient-to-br from-[#F8FBFF] to-white shadow-sm">
                  <h3 className="text-xl font-semibold text-[#0C1A35] mb-2">{t("exams.page.no_exams_found")}</h3>
                  <p className="text-sm text-[#0C1A35]/70 mb-4">
                    {t("common.try_adjusting_filters")}
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
                    {t("common.reset_filters")}
                  </Button>
                </Card>
              )}
            </div>
          </div>

          {/* About Section - Dynamic from Admin */}
          {/* {aboutSection.content && (
            <section className="mt-12 mb-8">
              <Card className="p-8 border border-gray-200 bg-white shadow-sm">
                <div 
                  className="text-[#0C1A35] mb-4"
                  dangerouslySetInnerHTML={{ 
                    __html: aboutSection.heading || "<h2 class=\"text-2xl font-bold\">About All Popular Exams Preparation</h2>"
                  }}
                />
                <TipTapContent
                  content={aboutSection.content}
                  className="space-y-4 text-[#0C1A35]/80 leading-relaxed"
                />
              </Card>
            </section>
          )} */}
        </div>
      </section>
    </div>
  );
}





