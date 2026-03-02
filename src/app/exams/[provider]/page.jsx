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

export const dynamic = "force-dynamic";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function fetchData() {
  try {
    const [
      providersRes,
      categoriesRes,
      coursesRes,
      trustBarRes,
      aboutRes,
    ] = await Promise.all([
      fetch(`${API_BASE_URL}/api/providers/`, { cache: "no-store" }),
      fetch(`${API_BASE_URL}/api/categories/`, { cache: "no-store" }),
      fetch(`${API_BASE_URL}/api/courses/`, { cache: "no-store" }),
      fetch(`${API_BASE_URL}/api/home/exams-trust-bar/`, { cache: "no-store" }),
      fetch(`${API_BASE_URL}/api/home/exams-about/`, { cache: "no-store" }),
    ]);

    const providersData = await providersRes.json();
    const categoriesData = await categoriesRes.json();
    const coursesData = await coursesRes.json();
    const trustBarData = await trustBarRes.json();
    const aboutData = await aboutRes.json();

    return {
      providers: Array.isArray(providersData)
        ? providersData.filter((p) => p.is_active)
        : [],
      categories: Array.isArray(categoriesData)
        ? categoriesData.filter((c) => c.is_active !== false)
        : [],
      exams: Array.isArray(coursesData)
        ? coursesData.filter((c) => c.is_active !== false)
        : [],
      trustBarItems: trustBarData?.success ? trustBarData.data : [],
      aboutSection: aboutData?.success ? aboutData.data : {},
    };
  } catch (error) {
    console.error("Server fetch error:", error);
    return {
      providers: [],
      categories: [],
      exams: [],
      trustBarItems: [],
      aboutSection: {},
    };
  }
}

export default async function ProviderExamsPage({ params }) {
  const { provider } = await params;
  const data = await fetchData();

  const initialProvider = provider ? [provider] : [];
  const initialKeyword = "";

  return (
    <ExamsPageContent
      initialProvidersData={data.providers}
      initialCategoriesData={data.categories}
      initialExamsData={data.exams}
      initialTrustBarData={data.trustBarItems}
      initialAboutData={data.aboutSection}
      initialProvider={initialProvider}
      initialKeyword={initialKeyword}
      usePathBasedRouting={true}
    />
  );
}