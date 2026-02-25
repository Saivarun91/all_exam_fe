// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Search } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { createSlug } from "@/lib/utils";
// import WebSiteJsonLd from "@/components/WebSiteJsonLd";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// const HeroSection = () => {
//   const router = useRouter();
//   const [heroData, setHeroData] = useState(null);
//   const [selectedProvider, setSelectedProvider] = useState("");
//   const [searchKeyword, setSearchKeyword] = useState("");
//   const [providers, setProviders] = useState([]);
// console.log(heroData);
//   useEffect(() => {
//     // Defer non-critical API call using requestIdleCallback to avoid render blocking
//     const fetchHeroData = async () => {
//       try {
//         const res = await fetch(`${API_BASE_URL}/api/home/hero/`);
//         const data = await res.json();
//         if (data.success && data.data) {
//           setHeroData(data.data);
//         }
//       } catch (err) {
//         console.error("Error fetching hero section:", err);
//         // Keep default values if fetch fails
//       }
//     };

//     // Use requestIdleCallback to defer non-critical data fetching
//     if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
//       requestIdleCallback(fetchHeroData, { timeout: 2000 });
//     } else {
//       // Fallback: use setTimeout for browsers without requestIdleCallback
//       setTimeout(fetchHeroData, 100);
//     }
//   }, []);

//   // Fetch providers
//   useEffect(() => {
//     const fetchProviders = async () => {
//       try {
//         const res = await fetch(`${API_BASE_URL}/api/providers/`);
//         const data = await res.json();
//         if (Array.isArray(data)) {
//           const activeProviders = data.filter(p => p.is_active !== false);
//           setProviders(activeProviders);
//         }
//       } catch (err) {
//         console.error("Error fetching providers:", err);
//         setProviders([]);
//       }
//     };
//     fetchProviders();
//   }, []);

//   const handleSearch = () => {
//     // Build SEO-friendly URL path (no query parameters)
//     let targetUrl = "/exams";
    
//     if (selectedProvider && searchKeyword.trim()) {
//       // Provider + keyword: /exams/provider/search/keyword
//       const keywordSlug = createSlug(searchKeyword.trim());
//       targetUrl = `/exams/${selectedProvider}/search/${encodeURIComponent(keywordSlug)}`;
//     } else if (selectedProvider) {
//       // Provider only: /exams/provider
//       targetUrl = `/exams/${selectedProvider}`;
//     } else if (searchKeyword.trim()) {
//       // Keyword only: /exams/search/keyword
//       const keywordSlug = createSlug(searchKeyword.trim());
//       targetUrl = `/exams/search/${encodeURIComponent(keywordSlug)}`;
//     }
    
//     // Navigate to the SEO-friendly URL
//     router.push(targetUrl);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") {
//       handleSearch();
//     }
//   };

//   // Use stats from backend if available, otherwise use defaults
//   const stats = (heroData?.stats && heroData.stats.length > 0) 
//     ? heroData.stats.filter(stat => stat.value && stat.label) // Filter out empty stats
//     : [
//         { value: "94%", label: "matched real exam difficulty" },
//         { value: "97%", label: "passed using our practice" },
//         { value: "1.8M+", label: "monthly practice sessions" },
//       ];

//   const title = heroData?.title || "Your Shortcut to Passing Any Certification Exam";
//   const subtitle = heroData?.subtitle || "Accurate, updated, exam-style questions trusted by thousands of professionals preparing for their next big certification.";

//   // Use background image if provided, otherwise use gradient
//   const backgroundStyle = heroData?.background_image_url
//     ? {
//         backgroundImage: `url(${heroData.background_image_url})`,
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//         backgroundRepeat: 'no-repeat'
//       }
//     : {};

//   return (
//     <section 
//       className="relative min-h-[450px] md:min-h-[550px] flex items-center overflow-hidden "
//       style={heroData?.background_image_url ? backgroundStyle : {}}
//     >
//       <WebSiteJsonLd heroData={heroData} siteName="AllExamQuestions" />
//       {/* Gradient overlay or default gradient background */}
//       {heroData?.background_image_url ? (
//         <div className="absolute inset-0 bg-gradient-to-br from-[#0C1A35]/90 via-[#0F2847]/85 to-[#132A54]/90"></div>
//       ) : (
//         <div className="absolute inset-0 bg-gradient-to-br from-[#0C1A35] via-[#0F2847] to-[#132A54]"></div>
//       )}
      
//       {/* Background effects */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute top-10 right-10 md:top-20 md:right-20 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#1A73E8]/10 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-10 left-10 md:bottom-20 md:left-20 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#0F3C71]/15 rounded-full blur-3xl"></div>
//       </div>

//       <div className="container mx-auto px-4 relative z-10 py-8 md:py-12">
//         <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6">
//           {/* Headline */}
//           <div className="space-y-3 md:space-y-4">
//             <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-[#F5F8FF] px-2">
//               {title}
//             </h1>
//             <p className="text-sm sm:text-base md:text-lg text-[#E7ECF6] max-w-2xl mx-auto leading-relaxed px-2">
//               {subtitle}
//             </p>
//           </div>

//           {/* Stats Strip */}
//           <div className="flex flex-wrap justify-center gap-4 md:gap-8 py-3 md:py-4">
//             {stats.map((stat, index) => (
//               <div key={index} className="text-center space-y-1">
//                 <div className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-[#E7ECF6] drop-shadow-[0_0_8px_rgba(26,115,232,0.3)]">
//                   {stat.value}
//                 </div>
//                 <div className="text-[10px] sm:text-xs text-[#E7ECF6] max-w-[130px] border-b border-[#1A73E8]/40 pb-1">
//                   {stat.label}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Search Bar */}
//           <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 p-3 md:p-4 max-w-3xl mx-auto">
//             <div className="flex flex-col md:flex-row gap-3 md:gap-3 items-center">
//               <Select value={selectedProvider} onValueChange={setSelectedProvider}>
//                 <SelectTrigger className="w-full md:w-[200px] bg-white/95 border-[#BFD4F5] h-11 min-h-[44px] text-sm text-[#0C1A35]">
//                   <SelectValue placeholder="Select Provider" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {providers.map((provider) => (
//                     <SelectItem key={provider.id} value={provider.slug} className="min-h-[44px]">
//                       {provider.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               <Input
//                 placeholder="Search exams, codes, or keywords..."
//                 className="flex-1 bg-white/95 border-[#BFD4F5] h-11 min-h-[44px] text-sm text-[#0C1A35] placeholder:text-[#0C1A35]/70"
//                 value={searchKeyword}
//                 onChange={(e) => setSearchKeyword(e.target.value)}
//                 onKeyPress={handleKeyPress}
//               />

//               <Button
//                 onClick={handleSearch}
//                 className="bg-[#1A73E8] text-white hover:bg-[#1557B0] w-full md:w-auto px-6 h-11 min-h-[44px] text-sm shadow-[0_4px_14px_rgba(26,115,232,0.4)]"
//               >
//                 <Search className="w-4 h-4 mr-2" />
//                 Search
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bottom Fade */}
//       <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white/5 pointer-events-none"></div>
//     </section>
//   );
// };

// export default HeroSection;




import WebSiteJsonLd from "@/components/WebSiteJsonLd";
import HeroSearchClient from "./HeroSearchClient";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function getHeroData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/home/hero/`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (data.success && data.data) return data.data;
  } catch (e) {}
  return null;
}

async function getProviders() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/providers/`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.filter((p) => p.is_active !== false);
    }
  } catch (e) {}
  return [];
}

export default async function HeroSection() {
  const heroData = await getHeroData();
  const providers = await getProviders();

  const stats =
    heroData?.stats?.length > 0
      ? heroData.stats.filter((s) => s.value && s.label)
      : [
          { value: "94%", label: "matched real exam difficulty" },
          { value: "97%", label: "passed using our practice" },
          { value: "1.8M+", label: "monthly practice sessions" },
        ];

  const title =
    heroData?.title ||
    "Your Shortcut to Passing Any Certification Exam";

  const subtitle =
    heroData?.subtitle ||
    "Accurate, updated, exam-style questions trusted by thousands of professionals preparing for their next big certification.";

  const backgroundStyle = heroData?.background_image_url
    ? {
        backgroundImage: `url(${heroData.background_image_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : {};

  return (
    <section
      className="relative min-h-[450px] md:min-h-[550px] flex items-center overflow-hidden"
      style={heroData?.background_image_url ? backgroundStyle : {}}
    >
      <WebSiteJsonLd heroData={heroData} siteName="AllExamQuestions" />

      {heroData?.background_image_url ? (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C1A35]/90 via-[#0F2847]/85 to-[#132A54]/90"></div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C1A35] via-[#0F2847] to-[#132A54]"></div>
      )}

      <div className="container mx-auto px-4 relative z-10 py-8 md:py-12">
        <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6">
          
          {/* TITLE */}
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-[#F5F8FF] px-2">
              {title}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-[#E7ECF6] max-w-2xl mx-auto leading-relaxed px-2">
              {subtitle}
            </p>
          </div>

          {/* STATS */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 py-3 md:py-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center space-y-1">
                <div className="text-3xl font-bold text-[#E7ECF6]">
                  {stat.value}
                </div>
                <div className="text-xs text-[#E7ECF6] border-b border-[#1A73E8]/40 pb-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* SEARCH CLIENT PART */}
          <HeroSearchClient providers={providers} />

        </div>
      </div>
    </section>
  );
}