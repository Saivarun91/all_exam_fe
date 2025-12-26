"use client";

import { useEffect, Suspense } from "react";
import dynamic from "next/dynamic";

// Critical above-the-fold component - lazy load with SSR for better performance
const HeroSection = dynamic(() => import("@/components/home/HeroSection"), {
  ssr: true,
  loading: () => <div className="min-h-[450px] md:min-h-[550px]" />,
});

// Non-critical components - lazy load with dynamic imports
const TopCategories = dynamic(() => import("@/components/home/TopCategories"), {
  loading: () => <div className="py-20" />,
});

const FeaturedExams = dynamic(() => import("@/components/home/FeaturedExams"), {
  loading: () => <div className="py-20" />,
});

const ValuePrepositions = dynamic(() => import("@/components/home/ValuePrepositions"), {
  loading: () => <div className="py-20" />,
});

const PopularProviders = dynamic(() => import("@/components/home/PopularProviders"), {
  loading: () => <div className="py-20" />,
});

const RecentlyUpdated = dynamic(() => import("@/components/home/RecentlyUpdated"), {
  loading: () => <div className="py-20" />,
});

const Testimonials = dynamic(() => import("@/components/home/Testimonials"), {
  loading: () => <div className="py-20" />,
});

const BlogSection = dynamic(() => import("@/components/home/BlogSection"), {
  loading: () => <div className="py-20" />,
});

const EmailSubscribe = dynamic(() => import("@/components/home/EmailSubscribe"), {
  loading: () => <div className="py-20" />,
});

const HomeFAQ = dynamic(() => import("@/components/home/HomeFAQ"), {
  loading: () => <div className="py-20" />,
});

export default function Page() {
  useEffect(() => {
    // Handle anchor links on page load - use requestAnimationFrame to avoid forced reflow
    const hash = window.location.hash;
    if (hash) {
      // Use requestAnimationFrame to avoid forced reflow
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const element = document.getElementById(hash.substring(1));
          if (element) {
            // Use scrollIntoView with requestAnimationFrame to batch layout operations
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      });
    }
  }, []);

  return (
    <div className="min-h-screen">
      <main>
        <HeroSection />
        <Suspense fallback={<div className="py-20" />}>
          <TopCategories />
        </Suspense>
        <Suspense fallback={<div className="py-20" />}>
          <FeaturedExams />
        </Suspense>
        <Suspense fallback={<div className="py-20" />}>
          <ValuePrepositions />
        </Suspense>
        <Suspense fallback={<div className="py-20" />}>
          <PopularProviders />
        </Suspense>
        <Suspense fallback={<div className="py-20" />}>
          <RecentlyUpdated />
        </Suspense>
        <Suspense fallback={<div className="py-20" />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<div className="py-20" />}>
          <BlogSection />
        </Suspense>
        <Suspense fallback={<div className="py-20" />}>
          <EmailSubscribe />
        </Suspense>
        <Suspense fallback={<div className="py-20" />}>
          <HomeFAQ />
        </Suspense>
      </main>
    </div>
  );
}
