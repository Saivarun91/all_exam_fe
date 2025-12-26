"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ExamsPageContent from "@/components/exams/ExamsPageContent";
import { createSlug } from "@/lib/utils";

function ExamsPageContentWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  // Redirect from query params to SEO-friendly paths (one-time redirect)
  useEffect(() => {
    if (hasRedirected.current) return;
    
    const q = searchParams?.get("q");
    const providerParam = searchParams?.get("provider");
    
    if (q || providerParam) {
      hasRedirected.current = true;
      
      // Build SEO-friendly URL
      let targetUrl = "/exams";
      
      if (providerParam && q) {
        // Provider + keyword: /exams/provider/search/keyword
        const keywordSlug = createSlug(q.trim());
        targetUrl = `/exams/${providerParam}/search/${encodeURIComponent(keywordSlug)}`;
      } else if (providerParam) {
        // Provider only: /exams/provider
        targetUrl = `/exams/${providerParam}`;
      } else if (q) {
        // Keyword only: /exams/search/keyword
        const keywordSlug = createSlug(q.trim());
        targetUrl = `/exams/search/${encodeURIComponent(keywordSlug)}`;
      }
      
      // Redirect to SEO-friendly URL
      router.replace(targetUrl);
    }
  }, [searchParams, router]);

  // Set canonical URL for exams listing page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      // Remove query parameters for canonical URL
      const pathWithoutQuery = currentPath.split('?')[0];
      const canonicalUrl = `https://allexamquestions.com${pathWithoutQuery}`;
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", canonicalUrl);
    }
  }, []);

  // Always use path-based routing (no query parameters)
  return <ExamsPageContent usePathBasedRouting={true} />;
}

export default function ExamsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
          <p className="text-[#0C1A35]/70">Loading exams...</p>
        </div>
      </div>
    }>
      <ExamsPageContentWrapper />
    </Suspense>
  );
}
