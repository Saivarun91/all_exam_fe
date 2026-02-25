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




import dynamic from "next/dynamic";

// Critical above-the-fold component - SSR with loading fallback
const HeroSection = dynamic(() => import("@/components/home/HeroSection"), {
  ssr: true,
  loading: () => <div className="min-h-[450px] md:min-h-[550px]" />,
});

// Non-critical components - lazy load dynamically
const TopCategories = dynamic(() => import("@/components/home/TopCategories"), {
  loading: () => <div className="py-20" />,
  ssr: true,
});

const FeaturedExams = dynamic(() => import("@/components/home/FeaturedExams"), {
  loading: () => <div className="py-20" />,
  ssr: true,
});

const ValuePrepositions = dynamic(() => import("@/components/home/ValuePropositions"), {
  loading: () => <div className="py-20" />,
  ssr: true,
});

const PopularProviders = dynamic(() => import("@/components/home/PopularProviders"), {
  loading: () => <div className="py-20" />,
  ssr: true,
});

const RecentlyUpdated = dynamic(() => import("@/components/home/RecentlyUpdated"), {
  loading: () => <div className="py-20" />,
  ssr: true,
});

const Testimonials = dynamic(() => import("@/components/home/Testimonials"), {
  loading: () => <div className="py-20" />,
  ssr: true,
});

// BlogSection is a server component - render directly
import BlogSection from "@/components/home/BlogSection";

const EmailSubscribe = dynamic(() => import("@/components/home/EmailSubscribe"), {
  loading: () => <div className="py-20" />,
  ssr: true,
});

const HomeFAQ = dynamic(() => import("@/components/home/HomeFAQ"), {
  loading: () => <div className="py-20" />,
  ssr: true,
});

// Optional: client-only scroll behavior
import ScrollHandler from "@/components/home/ScrollHandler";

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Client-only scroll handling */}
      <ScrollHandler />

      <main>
        <HeroSection />
        <TopCategories />
        <FeaturedExams />
        <ValuePrepositions />
        <PopularProviders />
        <RecentlyUpdated />
        <Testimonials />
        
        {/* ✅ BlogSection renders correctly server-side */}
        <BlogSection />

        <EmailSubscribe />
        <HomeFAQ />
      </main>
    </div>
  );
}