"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Set page title
    document.title = "Authentication - Login or Sign Up | AllExamQuestions";
  }, []);

  useEffect(() => {
    // Redirect based on tab parameter for backward compatibility
    const tab = searchParams.get('tab');
    const redirectUrl = searchParams.get('redirect');
    
    if (tab === 'signup') {
      // Redirect to signup page, preserving redirect parameter if present
      if (redirectUrl) {
        router.replace(`/auth/signup?redirect=${encodeURIComponent(redirectUrl)}`);
      } else {
        router.replace('/auth/signup');
      }
    } else {
      // Default to login page, preserving redirect parameter if present
      if (redirectUrl) {
        router.replace(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
      } else {
        router.replace('/auth/login');
      }
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
