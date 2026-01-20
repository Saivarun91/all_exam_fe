"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import ExamsPageContent from "@/components/exams/ExamsPageContent";

export default function ProviderKeywordExamsPage() {
  const params = useParams();
  const provider = params?.provider;
  const keyword = params?.keyword;

  // Decode keyword from URL (it's URL-encoded slug)
  // Convert slug back to searchable format by replacing hyphens with spaces
  let decodedKeyword = "";
  if (keyword) {
    const decoded = decodeURIComponent(keyword);
    // Replace hyphens with spaces for better search matching
    decodedKeyword = decoded.replace(/-/g, " ");
  }

  // Set dynamic page title
  useEffect(() => {
    if (typeof window !== "undefined" && provider && decodedKeyword) {
      const providerName = provider.charAt(0).toUpperCase() + provider.slice(1).replace(/-/g, ' ');
      const keywordTitle = decodedKeyword.charAt(0).toUpperCase() + decodedKeyword.slice(1);
      document.title = `${keywordTitle} - ${providerName} Certification Exams | AllExamQuestions`;
    }
  }, [provider, decodedKeyword]);

  // Initialize with provider and keyword from URL
  const initialProvider = provider ? [provider] : [];
  const initialKeyword = decodedKeyword;

  return (
    <ExamsPageContent 
      initialProvider={initialProvider}
      initialKeyword={initialKeyword}
      usePathBasedRouting={true}
    />
  );
}

