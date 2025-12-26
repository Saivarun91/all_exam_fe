"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to signup page
    router.replace("/auth/signup");
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to signup...</p>
      </div>
    </div>
  );
}

