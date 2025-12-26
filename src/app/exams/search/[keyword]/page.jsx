"use client";

import { useParams } from "next/navigation";
import ExamsPageContent from "@/components/exams/ExamsPageContent";

export default function KeywordExamsPage() {
  const params = useParams();
  const keyword = params?.keyword;

  // Decode keyword from URL (it's URL-encoded slug)
  // Convert slug back to searchable format by replacing hyphens with spaces
  let decodedKeyword = "";
  if (keyword) {
    const decoded = decodeURIComponent(keyword);
    // Replace hyphens with spaces for better search matching
    decodedKeyword = decoded.replace(/-/g, " ");
  }

  // Initialize with keyword only
  const initialProvider = [];
  const initialKeyword = decodedKeyword;

  return (
    <ExamsPageContent 
      initialProvider={initialProvider}
      initialKeyword={initialKeyword}
      usePathBasedRouting={true}
    />
  );
}

