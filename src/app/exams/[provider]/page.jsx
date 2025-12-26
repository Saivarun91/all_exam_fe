"use client";

import { useParams } from "next/navigation";
import ExamsPageContent from "@/components/exams/ExamsPageContent";

export default function ProviderExamsPage() {
  const params = useParams();
  const provider = params?.provider;

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

