// "use client";

// import { useParams } from "next/navigation";
// import { useEffect } from "react";
// import ExamsPageContent from "@/components/exams/ExamsPageContent";

// export default function KeywordExamsPage() {
//   const params = useParams();
//   const keyword = params?.keyword;

//   // Decode keyword from URL (it's URL-encoded slug)
//   // Convert slug back to searchable format by replacing hyphens with spaces
//   let decodedKeyword = "";
//   if (keyword) {
//     const decoded = decodeURIComponent(keyword);
//     // Replace hyphens with spaces for better search matching
//     decodedKeyword = decoded.replace(/-/g, " ");
//   }

//   // Set dynamic page title
//   useEffect(() => {
//     if (typeof window !== "undefined" && decodedKeyword) {
//       const keywordTitle = decodedKeyword.charAt(0).toUpperCase() + decodedKeyword.slice(1);
//       document.title = `Search: ${keywordTitle} - Certification Exams | AllExamQuestions`;
//     }
//   }, [decodedKeyword]);

//   // Initialize with keyword only
//   const initialProvider = [];
//   const initialKeyword = decodedKeyword;

//   return (
//     <ExamsPageContent 
//       initialProvider={initialProvider}
//       initialKeyword={initialKeyword}
//       usePathBasedRouting={true}
//     />
//   );
// }




// import ExamsPageContent from "@/components/exams/ExamsPageContent";

// export default function KeywordExamsPage({ params }) {
//   const keyword = params?.keyword;

//   // Decode keyword from URL (it's URL-encoded slug)
//   // Convert slug back to searchable format by replacing hyphens with spaces
//   let decodedKeyword = "";

//   if (keyword) {
//     const decoded = decodeURIComponent(keyword);
//     decodedKeyword = decoded.replace(/-/g, " ");
//   }

//   // Initialize with keyword only
//   const initialProvider = [];
//   const initialKeyword = decodedKeyword;

//   return (
//     <ExamsPageContent
//       initialProvider={initialProvider}
//       initialKeyword={initialKeyword}
//       usePathBasedRouting={true}
//     />
//   );
// }





import ExamsPageContent from "@/components/exams/ExamsPageContent";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function fetchExams() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/courses/`, {
      cache: "no-store",
    });
    const data = await res.json();
    return Array.isArray(data)
      ? data.filter((c) => c.is_active !== false)
      : [];
  } catch {
    return [];
  }
}

export default async function KeywordExamsPage({ params }) {
  const { keyword } = await params;

  const decodedKeyword = decodeURIComponent(keyword).replace(/-/g, " ");

  const exams = await fetchExams(); // ✅ IMPORTANT

  return (
    <ExamsPageContent
      initialProvider={[]}
      initialKeyword={decodedKeyword}
      initialExamsData={exams}   // ✅ PASS THIS
      usePathBasedRouting={true}
    />
  );
}