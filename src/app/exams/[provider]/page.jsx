"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import ExamsPageContent from "@/components/exams/ExamsPageContent";

export default function ProviderExamsPage() {
  const params = useParams();
  const provider = params?.provider;

  // Set dynamic page title
  useEffect(() => {
    if (typeof window !== "undefined" && provider) {
      const providerName = provider.charAt(0).toUpperCase() + provider.slice(1).replace(/-/g, ' ');
      document.title = `${providerName} Certification Exams - Practice Tests | AllExamQuestions`;
    }
  }, [provider]);

  // Initialize with provider from URL
  const initialProvider = provider ? [provider] : [];
  const initialKeyword = "";

  return (
    <ExamsPageContent 
      initialProvider={initialProvider}
      initialKeyword={initialKeyword}
      usePathBasedRouting={true}
    />
  );
}

