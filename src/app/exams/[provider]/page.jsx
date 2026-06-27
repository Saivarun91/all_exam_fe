// "use client";

// import { useParams } from "next/navigation";
// import { useEffect } from "react";
// import ExamsPageContent from "@/components/exams/ExamsPageContent";

// export default function ProviderExamsPage() {
//   const params = useParams();
//   const provider = params?.provider;

//   // Set dynamic page title
//   useEffect(() => {
//     if (typeof window !== "undefined" && provider) {
//       const providerName = provider.charAt(0).toUpperCase() + provider.slice(1).replace(/-/g, ' ');
//       document.title = `${providerName} Certification Exams - Practice Tests | AllExamQuestions`;
//     }
//   }, [provider]);

//   // Initialize with provider from URL
//   const initialProvider = provider ? [provider] : [];
//   const initialKeyword = "";

//   return (
//     <ExamsPageContent 
//       initialProvider={initialProvider}
//       initialKeyword={initialKeyword}
//       usePathBasedRouting={true}
//     />
//   );
// }




// import ExamsPageContent from "@/components/exams/ExamsPageContent";

// export default function ProviderExamsPage({ params }) {
//   const provider = params?.provider;
  

//   // Initialize with provider from URL
//   const initialProvider = provider ? [provider] : [];
//   const initialKeyword = "";

//   return (
//     <ExamsPageContent
//       initialProvider={initialProvider}
//       initialKeyword={initialKeyword}
//       usePathBasedRouting={true}
//     />
//   );
// }





// import ExamsPageContent from "@/components/exams/ExamsPageContent";

// export default async function ProviderExamsPage({ params }) {
//   const { provider } = await params;

//   // Initialize with provider from URL
//   const initialProvider = provider ? [provider] : [];
//   const initialKeyword = "";

//   return (
//     <ExamsPageContent
//       initialProvider={initialProvider}
//       initialKeyword={initialKeyword}
//       usePathBasedRouting={true}
//     />
//   );
// }





import ExamsPageContent from "@/components/exams/ExamsPageContent";
import { fetchExamsPageData } from "@/lib/fetchExamsPageData";
import { publicFetchOptions } from "@/lib/serverRevalidate";

export const revalidate = 60;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function firstSearchParamValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

async function fetchData(provider, searchParams = {}) {
  try {
    const [examsData, examsSeoRes] = await Promise.all([
      fetchExamsPageData({
        page: firstSearchParamValue(searchParams.page) || 1,
        provider,
      }),
      fetch(`${API_BASE_URL}/api/home/exams-page-seo/`, publicFetchOptions()),
    ]);

    const examsSeoData = await examsSeoRes.json();

    return {
      ...examsData,
      examsPageHeading:
        (examsSeoData?.page_h1 && String(examsSeoData.page_h1).trim()) ||
        "All Popular Exams",
    };
  } catch (error) {
    console.error("Server fetch error:", error);
    return {
      providers: [],
      categories: [],
      exams: [],
      examsPagination: {
        count: 0,
        page: 1,
        page_size: 12,
        total_pages: 1,
      },
      trustBarItems: [],
      aboutSection: {},
      examsPageHeading: "All Popular Exams",
    };
  }
}

export default async function ProviderExamsPage({ params, searchParams }) {
  const { provider } = await params;
  const resolvedSearchParams = await searchParams;
  const data = await fetchData(provider, resolvedSearchParams || {});

  const initialProvider = provider ? [provider] : [];
  const initialKeyword = "";

  return (
    <ExamsPageContent
      initialProvidersData={data.providers}
      initialCategoriesData={data.categories}
      initialExamsData={data.exams}
      initialExamsPagination={data.examsPagination}
      initialTrustBarData={data.trustBarItems}
      initialAboutData={data.aboutSection}
      initialPageHeading={data.examsPageHeading}
      initialProvider={initialProvider}
      initialKeyword={initialKeyword}
      usePathBasedRouting={true}
      backendPagination={true}
    />
  );
}