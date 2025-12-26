"use client";

import { useParams } from "next/navigation";
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

