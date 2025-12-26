"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to login page
    router.replace("/auth/login");
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}

