// "use client";

// import { useEffect, Suspense } from "react";
// import dynamic from "next/dynamic";

// // Critical above-the-fold component - lazy load with SSR for better performance
// const HeroSection = dynamic(() => import("@/components/home/HeroSection"), {
//   ssr: true,
//   loading: () => <div className="min-h-[450px] md:min-h-[550px]" />,
// });

// // Non-critical components - lazy load with dynamic imports
// const TopCategories = dynamic(() => import("@/components/home/TopCategories"), {
//   loading: () => <div className="py-20" />,
// });

// const FeaturedExams = dynamic(() => import("@/components/home/FeaturedExams"), {
//   loading: () => <div className="py-20" />,
// });

// const ValuePrepositions = dynamic(() => import("@/components/home/ValuePrepositions"), {
//   loading: () => <div className="py-20" />,
// });

// const PopularProviders = dynamic(() => import("@/components/home/PopularProviders"), {
//   loading: () => <div className="py-20" />,
// });

// const RecentlyUpdated = dynamic(() => import("@/components/home/RecentlyUpdated"), {
//   loading: () => <div className="py-20" />,
// });

// const Testimonials = dynamic(() => import("@/components/home/Testimonials"), {
//   loading: () => <div className="py-20" />,
// });

// const BlogSection = dynamic(() => import("@/components/home/BlogSection"), {
//   loading: () => <div className="py-20" />,
// });

// const EmailSubscribe = dynamic(() => import("@/components/home/EmailSubscribe"), {
//   loading: () => <div className="py-20" />,
// });

// const HomeFAQ = dynamic(() => import("@/components/home/HomeFAQ"), {
//   loading: () => <div className="py-20" />,
// });

// export default function Page() {
//   useEffect(() => {
//     // Check if this is a back/forward navigation
//     const navigationType = window.performance?.getEntriesByType?.('navigation')?.[0]?.type;
//     const isBackForward = navigationType === 'back_forward';
    
//     // Handle anchor links on page load - wait for page to be fully rendered
//     const hash = window.location.hash;
    
//     // Only scroll to hash section if it's a direct navigation (not back/forward)
//     if (hash && !isBackForward) {
//       // Wait for all components to load, then scroll
//       const scrollToSection = () => {
//         const element = document.getElementById(hash.substring(1));
//         if (element) {
//           // Account for fixed header height (64px mobile, 80px desktop)
//           const headerHeight = window.innerWidth >= 768 ? 80 : 64;
//           const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
//           const offsetPosition = elementPosition - headerHeight;
          
//           window.scrollTo({
//             top: offsetPosition,
//             behavior: "smooth"
//           });
//         } else {
//           // If element not found yet, try again after a short delay
//           setTimeout(scrollToSection, 100);
//         }
//       };
      
//       // Use multiple requestAnimationFrame calls to ensure page is rendered
//       requestAnimationFrame(() => {
//         requestAnimationFrame(() => {
//           // Additional delay to ensure dynamic components are loaded
//           setTimeout(scrollToSection, 300);
//         });
//       });
//     } else {
//       // If no hash or back/forward navigation, ensure page starts at top
//       window.scrollTo({ top: 0, behavior: 'instant' });
      
//       // If there's a hash from back navigation, remove it
//       if (hash && isBackForward) {
//         window.history.replaceState(null, '', window.location.pathname);
//       }
//     }
//   }, []);

//   return (
//     <div className="min-h-screen">
//       <main>
//         <HeroSection />
//         <Suspense fallback={<div className="py-20" />}>
//           <TopCategories />
//         </Suspense>
//         <Suspense fallback={<div className="py-20" />}>
//           <FeaturedExams />
//         </Suspense>
//         <Suspense fallback={<div className="py-20" />}>
//           <ValuePrepositions />
//         </Suspense>
//         <Suspense fallback={<div className="py-20" />}>
//           <PopularProviders />
//         </Suspense>
//         <Suspense fallback={<div className="py-20" />}>
//           <RecentlyUpdated />
//         </Suspense>
//         <Suspense fallback={<div className="py-20" />}>
//           <Testimonials />
//         </Suspense>
//         <Suspense fallback={<div className="py-20" />}>
//           <BlogSection />
//         </Suspense>
//         <Suspense fallback={<div className="py-20" />}>
//           <EmailSubscribe />
//         </Suspense>
//         <Suspense fallback={<div className="py-20" />}>
//           <HomeFAQ />
//         </Suspense>
//       </main>
//     </div>
//   );
// }



// import dynamic from "next/dynamic";

// // Critical above-the-fold component - SSR with loading fallback
// const HeroSection = dynamic(() => import("@/components/home/HeroSection"), {
//   ssr: true,
//   loading: () => <div className="min-h-[450px] md:min-h-[550px]" />,
// });

// // Non-critical components - lazy load dynamically
// const TopCategories = dynamic(() => import("@/components/home/TopCategories"), {
//   loading: () => <div className="py-20" />,
//   ssr: true,
// });

// const FeaturedExams = dynamic(() => import("@/components/home/FeaturedExams"), {
//   loading: () => <div className="py-20" />,
//   ssr: true,
// });

// const ValuePrepositions = dynamic(() => import("@/components/home/ValuePrepositions"), {
//   loading: () => <div className="py-20" />,
//   ssr: true,
// });

// const PopularProviders = dynamic(() => import("@/components/home/PopularProviders"), {
//   loading: () => <div className="py-20" />,
//   ssr: true,
// });

// const RecentlyUpdated = dynamic(() => import("@/components/home/RecentlyUpdated"), {
//   loading: () => <div className="py-20" />,
//   ssr: true,
// });

// const Testimonials = dynamic(() => import("@/components/home/Testimonials"), {
//   loading: () => <div className="py-20" />,
//   ssr: true,
// });

// // BlogSection is a server component - render directly
// import BlogSection from "@/components/home/BlogSection";

// const EmailSubscribe = dynamic(() => import("@/components/home/EmailSubscribe"), {
//   loading: () => <div className="py-20" />,
//   ssr: true,
// });

// const HomeFAQ = dynamic(() => import("@/components/home/HomeFAQ"), {
//   loading: () => <div className="py-20" />,
//   ssr: true,
// });

// // Optional: client-only scroll behavior
// import ScrollHandler from "@/components/home/ScrollHandler";

// export default function Page() {
//   return (
//     <div className="min-h-screen">
//       {/* Client-only scroll handling */}
//       <ScrollHandler />

//       <main>
//         <HeroSection />
//         <TopCategories />
//         <FeaturedExams />
//         <ValuePrepositions />
//         <PopularProviders />
//         <RecentlyUpdated />
//         <Testimonials />
        
//         {/* ✅ BlogSection renders correctly server-side */}
//         <BlogSection />

//         <EmailSubscribe />
//         <HomeFAQ />
//       </main>
//     </div>
//   );
// }






import dynamicImport from "next/dynamic";


// ================= DYNAMIC COMPONENTS =================

const HeroSection = dynamicImport(() => import("../components/home/HeroSection"), {
  ssr: true,
  loading: () => <div className="min-h-[450px] md:min-h-[550px]" />,
});

const SeoIntroSection = dynamicImport(() => import("../components/home/SeoIntroSection"), {
  ssr: true,
  loading: () => <div className="py-20" />,
});


const TopCategories = dynamicImport(() => import("../components/home/TopCategories"), {
  ssr: true,
  loading: () => <div className="py-20" />,
});

const FeaturedExams = dynamicImport(() => import("../components/home/FeaturedExams"), {
  ssr: true,
  loading: () => <div className="py-20" />,
});

const ValuePrepositions = dynamicImport(() => import("../components/home/ValuePropositions"), {
  ssr: true,
  loading: () => <div className="py-20" />,
});

const PopularProviders = dynamicImport(() => import("../components/home/PopularProviders"), {
  ssr: true,
  loading: () => <div className="py-20" />,
});

const RecentlyUpdated = dynamicImport(() => import("../components/home/RecentlyUpdated"), {
  ssr: true,
  loading: () => <div className="py-20" />,
});

const Testimonials = dynamicImport(() => import("../components/home/Testimonials"), {
  ssr: true,
  loading: () => <div className="py-20" />,
});

const EmailSubscribe = dynamicImport(() => import("../components/home/EmailSubscribe"), {
  ssr: true,
  loading: () => <div className="py-20" />,
});


const HomeFAQ = dynamicImport(() => import("../components/home/HomeFAQ"), {
  ssr: true,
  loading: () => <div className="py-20" />,
});

// Server component
import BlogSection from "../components/home/BlogSection";
import ScrollHandler from "../components/home/ScrollHandler";

// ================= METADATA =================

// export async function generateMetadata() {
//   try {
//     const API_BASE =
//       process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

//     const res = await fetch(
//       `${API_BASE}/api/home/home-page-seo/`,
//       { cache: "no-store" }
//     );

//     if (!res.ok) {
//       return { title: "All Exam Questions" };
//     }

//     const result = await res.json();
//     const seo = result?.data || {};

//     return {
//       title: seo.meta_title + " | All Exam Questions" || "",
//       description: seo.meta_description || "",
//       keywords: seo.meta_keywords || "",
//       metadataBase: new URL("https://allexamquestions.com"),
//       alternates: {
//         canonical: "/", // ✅ relative path
//       },
//     };
//     // const baseTitle = seo?.meta_title?.trim() || "All Exam Questions";

//     // return {
//     //   title: baseTitle.includes("All Exam Questions")
//     //     ? baseTitle
//     //     : `${baseTitle} | All Exam Questions`,
//     //   description: seo?.meta_description || "",
//     //   keywords: seo?.meta_keywords || "",
//     //   metadataBase: new URL("https://allexamquestions.com"),
//     //   alternates: {
//     //     canonical: "/",
//     //   },
//     // };
//   } catch (error) {
//     return { title: "All Exam Questions" };
//   }
// }


export async function generateMetadata() {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

    // Fetch with server-side caching so metadata can be SSR
    const res = await fetch(`${API_BASE}/api/home/home-page-seo/`, {
      next: { revalidate: 60 }, // ✅ ISR, avoids no-store
    });

    if (!res.ok) return { title: "All Exam Questions" };

    const seo = (await res.json())?.data || {};

    const baseTitle = seo.meta_title?.trim() || "All Exam Questions";

    return {
      title: baseTitle.includes("All Exam Questions")
        ? baseTitle
        : `${baseTitle} | All Exam Questions`,
      description: seo.meta_description || "",
      keywords: seo.meta_keywords || "",
      metadataBase: new URL("https://allexamquestions.com"),
      alternates: {
        canonical: "/", // full URL = https://allexamquestions.com/
      },
      openGraph: {
        title: baseTitle.includes("All Exam Questions")
          ? baseTitle
          : `${baseTitle} | All Exam Questions`,
        description: seo.meta_description || "",
        url: "https://allexamquestions.com",
        siteName: "All Exam Questions",
        images: [
          {
            url: "https://allexamquestions.com/alleq_logo.png",
            width: 1200,
            height: 630,
          },
        ],
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: baseTitle.includes("All Exam Questions")
          ? baseTitle
          : `${baseTitle} | All Exam Questions`,
        description: seo.meta_description || "",
        images: ["https://allexamquestions.com/twitter_logo.png"],
      },
      


    };
  } catch (err) {
    return { title: "All Exam Questions" };
  }
}

// ================= PAGE =================

export default function Page() {
  return (
    <div className="min-h-screen">
      <ScrollHandler />

      <main>
        <HeroSection />
        <SeoIntroSection />
        <TopCategories />
        <FeaturedExams />
        <ValuePrepositions />
        <PopularProviders />
        <RecentlyUpdated />
        <Testimonials />
        <BlogSection />
        <EmailSubscribe />
        <HomeFAQ />
      </main>
    </div>
  );
}






