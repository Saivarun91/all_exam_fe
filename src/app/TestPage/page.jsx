"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Redirect old route to new SEO-friendly route
function TestPageRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const provider = searchParams.get("provider");
    const examCode = searchParams.get("examCode");
    const testId = searchParams.get("testId");
    
    if (provider && examCode && testId) {
      // Redirect to new SEO-friendly URL
      router.replace(`/exams/${provider}/${examCode}/practice/${testId}`);
    } else {
      // No params, go to exams page
      router.replace("/exams");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
        <p className="text-[#0C1A35]/70">Redirecting...</p>
      </div>
    </div>
  );
}

// Redirect old route to new SEO-friendly route
export default function TestPageRedirect() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
            <p className="text-[#0C1A35]/70">Loading...</p>
          </div>
        </div>
      }
    >
      <TestPageRedirectContent />
    </Suspense>
  );
}

