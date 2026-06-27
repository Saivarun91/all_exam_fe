// "use client";

// import { Suspense, useEffect, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import ExamsPageContent from "@/components/exams/ExamsPageContent";
// import { createSlug } from "@/lib/utils";

// function ExamsPageContentWrapper() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const hasRedirected = useRef(false);

//   // Redirect from query params to SEO-friendly paths (one-time redirect)
//   useEffect(() => {
//     if (hasRedirected.current) return;
    
//     const q = searchParams?.get("q");
//     const providerParam = searchParams?.get("provider");
    
//     if (q || providerParam) {
//       hasRedirected.current = true;
      
//       // Build SEO-friendly URL
//       let targetUrl = "/exams";
      
//       if (providerParam && q) {
//         // Provider + keyword: /exams/provider/search/keyword
//         const keywordSlug = createSlug(q.trim());
//         targetUrl = `/exams/${providerParam}/search/${encodeURIComponent(keywordSlug)}`;
//       } else if (providerParam) {
//         // Provider only: /exams/provider
//         targetUrl = `/exams/${providerParam}`;
//       } else if (q) {
//         // Keyword only: /exams/search/keyword
//         const keywordSlug = createSlug(q.trim());
//         targetUrl = `/exams/search/${encodeURIComponent(keywordSlug)}`;
//       }
      
//       // Redirect to SEO-friendly URL
//       router.replace(targetUrl);
//     }
//   }, [searchParams, router]);

//   // Set page title and canonical URL for exams listing page
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       // Set dynamic page title
//       document.title = "All Certification Exams - Practice Tests | AllExamQuestions";
      
//       const currentPath = window.location.pathname;
//       // Remove query parameters for canonical URL
//       const pathWithoutQuery = currentPath.split('?')[0];
//       const canonicalUrl = `https://allexamquestions.com${pathWithoutQuery}`;
//       let canonicalLink = document.querySelector('link[rel="canonical"]');
//       if (!canonicalLink) {
//         canonicalLink = document.createElement("link");
//         canonicalLink.setAttribute("rel", "canonical");
//         document.head.appendChild(canonicalLink);
//       }
//       canonicalLink.setAttribute("href", canonicalUrl);
//     }
//   }, []);

//   // Always use path-based routing (no query parameters)
//   return <ExamsPageContent usePathBasedRouting={true} />;
// }

// export default function ExamsPage() {
//   return (
//     <Suspense fallback={
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
//           <p className="text-[#0C1A35]/70">Loading exams...</p>
//         </div>
//       </div>
//     }>
//       <ExamsPageContentWrapper />
//     </Suspense>
//   );
// }




// ❌ REMOVE "use client"

// import { Suspense } from "react";
// import ExamsPageContent from "@/components/exams/ExamsPageContent";

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// export async function generateMetadata() {
//   const siteUrl =
//     process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
//   return {
//     title: "Certification Exams | AllExamQuestions",
//     description:
//       "Explore certification exams by top providers and categories. AllExamQuestions is a platform for practicing for certification exams.",
//     alternates: {
//       canonical: "https://allexamquestions.com/exams",
//     },
//   };
// }
// async function fetchData() {
//   try {
//     const [
//       providersRes,
//       categoriesRes,
//       coursesRes,
//       trustBarRes,
//       aboutRes,
//     ] = await Promise.all([
//       fetch(`${API_BASE_URL}/api/providers/`, { cache: "no-store" }),
//       fetch(`${API_BASE_URL}/api/categories/`, { cache: "no-store" }),
//       fetch(`${API_BASE_URL}/api/courses/`, { cache: "no-store" }),
//       fetch(`${API_BASE_URL}/api/home/exams-trust-bar/`, { cache: "no-store" }),
//       fetch(`${API_BASE_URL}/api/home/exams-about/`, { cache: "no-store" }),
//     ]);

//     const providersData = await providersRes.json();
//     const categoriesData = await categoriesRes.json();
//     const coursesData = await coursesRes.json();
//     const trustBarData = await trustBarRes.json();
//     const aboutData = await aboutRes.json();

//     return {
//       providers:
//         Array.isArray(providersData)
//           ? providersData.filter((p) => p.is_active)
//           : [],
//       categories:
//         Array.isArray(categoriesData)
//           ? categoriesData.filter((c) => c.is_active !== false)
//           : [],
//       exams:
//         Array.isArray(coursesData)
//           ? coursesData.filter((c) => c.is_active !== false)
//           : [],
//       trustBarItems: trustBarData?.success ? trustBarData.data : [],
//       aboutSection: aboutData?.success ? aboutData.data : {},
//     };
//   } catch (error) {
//     console.error("Server fetch error:", error);
//     return {
//       providers: [],
//       categories: [],
//       exams: [],
//       trustBarItems: [],
//       aboutSection: {},
//     };
//   }
// }

// export default async function ExamsPage() {
//   const data = await fetchData();

//   return (
//     <Suspense fallback={null}>
//       <ExamsPageContent
//         initialProvidersData={data.providers}
//         initialCategoriesData={data.categories}
//         initialExamsData={data.exams}
//         initialTrustBarData={data.trustBarItems}
//         initialAboutData={data.aboutSection}
//         usePathBasedRouting={true}
//       />
//     </Suspense>
//   );
// }



  

// import { Suspense } from "react";
// import ExamsPageContent from "@/components/exams/ExamsPageContent";
// export const dynamic = "force-dynamic";

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// // Fetch exams page data
// async function fetchData() {
//   try {
//     const [
//       providersRes,
//       categoriesRes,
//       coursesRes,
//       trustBarRes,
//       aboutRes,
//     ] = await Promise.all([
//       fetch(`${API_BASE_URL}/api/providers/`, { cache: "no-store" }),
//       fetch(`${API_BASE_URL}/api/categories/`, { cache: "no-store" }),
//       fetch(`${API_BASE_URL}/api/courses/`, { cache: "no-store" }),
//       fetch(`${API_BASE_URL}/api/home/exams-trust-bar/`, { cache: "no-store" }),
//       fetch(`${API_BASE_URL}/api/home/exams-about/`, { cache: "no-store" }),
//     ]);

//     const providersData = await providersRes.json();
//     const categoriesData = await categoriesRes.json();
//     const coursesData = await coursesRes.json();
//     const trustBarData = await trustBarRes.json();
//     const aboutData = await aboutRes.json();

//     return {
//       providers: Array.isArray(providersData)
//         ? providersData.filter((p) => p.is_active)
//         : [],
//       categories: Array.isArray(categoriesData)
//         ? categoriesData.filter((c) => c.is_active !== false)
//         : [],
//       exams: Array.isArray(coursesData)
//         ? coursesData.filter((c) => c.is_active !== false)
//         : [],
//       trustBarItems: trustBarData?.success ? trustBarData.data : [],
//       aboutSection: aboutData?.success ? aboutData.data : {},
//     };
//   } catch (error) {
//     console.error("Server fetch error:", error);
//     return {
//       providers: [],
//       categories: [],
//       exams: [],
//       trustBarItems: [],
//       aboutSection: {},
//     };
//   }
// }

// // export async function generateMetadata() {
// //   try {
// //     const res = await fetch(
// //       `${API_BASE_URL}/api/home/exams-page-seo/`,
// //       { cache: "no-store" }
// //     );

// //     if (!res.ok) {
// //       return { title: "Exams" };
// //     }

// //     const seoData = await res.json();
// //     console.log("SEO DATA", seoData);

// //     return {
// //       title: seoData.meta_title + " | All Exam Questions" || "",
// //       description: seoData.meta_description || "",
// //       keywords: seoData.meta_keywords || "",
// //       metadataBase: new URL("https://allexamquestions.com"),
// //       alternates: {
// //         canonical: "/exams", // ✅ relative path
// //       },
// //     };
// //   } catch {
// //     return { title: "Exams" };
// //   }
// // }

// // Main exams page
// export async function generateMetadata() {
//   try {
//     const res = await fetch(
//       `${API_BASE_URL}/api/home/exams-page-seo/`,
//       { cache: "no-store" }
//     );

//     if (!res.ok) {
//       return {
//         title: "Exams | All Exam Questions",
//         description: "Explore all exams on All Exam Questions platform.",
//         metadataBase: new URL("https://allexamquestions.com"),
//         alternates: {
//           canonical: "/exams",
//         },
//       };
//     }

//     const seoData = await res.json();

//     return {
//       metadataBase: new URL("https://allexamquestions.com"),

//       title: seoData?.meta_title
//         ? `${seoData.meta_title} | All Exam Questions`
//         : "Exams | All Exam Questions",

//       description:
//         seoData?.meta_description ||
//         "Explore all exams on All Exam Questions platform.",

//       keywords: seoData?.meta_keywords || "",

//       alternates: {
//         canonical: "/exams",
//       },

//       openGraph: {
//         title: seoData?.meta_title
//           ? `${seoData.meta_title} | All Exam Questions`
//           : "Exams | All Exam Questions",
//         description:
//           seoData?.meta_description ||
//           "Explore all exams on All Exam Questions platform.",
//         url: "https://allexamquestions.com/exams",
//         type: "website",
//         images: [
//           {
//             url: seoData?.meta_image
//               ? seoData.meta_image
//               : "https://allexamquestions.com/alleq_logo.png",
//             width: 1200,
//             height: 630,
//             alt: seoData?.meta_title || "All Exam Questions Exams Page",
//           },
//         ],
//       },
//     };
//   } catch (error) {
//     return {
//       title: "Exams | All Exam Questions",
//       description: "Explore all exams on All Exam Questions platform.",
//       metadataBase: new URL("https://allexamquestions.com"),
//       alternates: {
//         canonical: "/exams",
//       },
//     };
//   }
// }

// export default async function ExamsPage() {
//   const data = await fetchData();
  

//   return (
//     <Suspense fallback={null}>
//       <ExamsPageContent
//         initialProvidersData={data.providers}
//         initialCategoriesData={data.categories}
//         initialExamsData={data.exams}
//         initialTrustBarData={data.trustBarItems}
//         initialAboutData={data.aboutSection}
//         usePathBasedRouting={true}
//       />
//     </Suspense>
//   );
// }




// app/exams/page.tsx (or .jsx)
import { cache } from "react";
import ExamsPageContent from "@/components/exams/ExamsPageContent";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import SiteBreadcrumbs, {
  SiteBreadcrumbBar,
  toBreadcrumbJsonLdItems,
} from "@/components/common/SiteBreadcrumbs";
import { filterPublicExamListings } from "@/lib/examListingFilters";
import {
  categoriesListUrl,
  coursesListUrl,
  publicFetchOptions,
  providersListUrl,
} from "@/lib/serverRevalidate";

const EXAMS_BREADCRUMB_ITEMS = [
  { label: "Home", href: "/" },
  { label: "All Exams", href: "/exams" },
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const EXAMS_PAGE_SIZE = 12;

function firstSearchParamValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizePositiveInt(value, fallback) {
  const parsed = Number.parseInt(firstSearchParamValue(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeCoursesPayload(data) {
  if (Array.isArray(data)) {
    return {
      exams: filterPublicExamListings(data),
      pagination: {
        count: data.length,
        page: 1,
        page_size: EXAMS_PAGE_SIZE,
        total_pages: Math.max(1, Math.ceil(data.length / EXAMS_PAGE_SIZE)),
      },
    };
  }

  const results = Array.isArray(data?.results) ? data.results : [];
  return {
    exams: filterPublicExamListings(results),
    pagination: {
      count: Number(data?.count) || results.length,
      page: Number(data?.page) || 1,
      page_size: Number(data?.page_size) || EXAMS_PAGE_SIZE,
      total_pages: Number(data?.total_pages) || 1,
    },
  };
}

const fetchExamsPageSeo = cache(async function fetchExamsPageSeo() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/home/exams-page-seo/`,
      publicFetchOptions()
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
});

// ------------------ Fetch Data ------------------
const fetchData = cache(async function fetchData(searchParams = {}) {
  try {
    const page = normalizePositiveInt(searchParams.page, 1);
    const q = String(firstSearchParamValue(searchParams.q) || "").trim();
    const provider = String(firstSearchParamValue(searchParams.provider) || "").trim();
    const category = String(firstSearchParamValue(searchParams.category) || "").trim();
    const minQuestions = String(
      firstSearchParamValue(searchParams.min_questions) || ""
    ).trim();
    const courseParams = {
      page,
      page_size: EXAMS_PAGE_SIZE,
      q,
      provider,
      category,
      min_questions: minQuestions,
    };
    const coursesUrl = coursesListUrl(API_BASE_URL, courseParams);
    if (process.env.NODE_ENV !== "production") {
      console.log("[/exams] courses API hit:", coursesUrl);
    }
    const [providersRes, categoriesRes, coursesRes, trustBarRes, aboutRes, examsSeoData] =
      await Promise.all([
        fetch(providersListUrl(API_BASE_URL), publicFetchOptions()),
        fetch(categoriesListUrl(API_BASE_URL), publicFetchOptions()),
        fetch(coursesUrl, publicFetchOptions()),
        fetch(`${API_BASE_URL}/api/home/exams-trust-bar/`, publicFetchOptions()),
        fetch(`${API_BASE_URL}/api/home/exams-about/`, publicFetchOptions()),
        fetchExamsPageSeo(),
      ]);

    const providersData = await providersRes.json();
    const categoriesData = await categoriesRes.json();
    const coursesData = await coursesRes.json();
    const trustBarData = await trustBarRes.json();
    const aboutData = await aboutRes.json();
    const courses = normalizeCoursesPayload(coursesData);
    if (process.env.NODE_ENV !== "production") {
      console.log("[/exams] courses API data:", {
        pagination: courses.pagination,
        itemCount: courses.exams.length,
        sample: courses.exams.slice(0, 3).map((exam) => ({
          id: exam.id,
          title: exam.title || exam.name,
          code: exam.code,
          provider: exam.provider,
        })),
      });
    }

    return {
      providers: Array.isArray(providersData)
        ? providersData.filter((p) => p.is_active)
        : [],
      categories: Array.isArray(categoriesData)
        ? categoriesData.filter((c) => c.is_active !== false)
        : [],
      exams: courses.exams,
      examsPagination: courses.pagination,
      trustBarItems: trustBarData?.success ? trustBarData.data : [],
      aboutSection: aboutData?.success ? aboutData.data : {},
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
        page_size: EXAMS_PAGE_SIZE,
        total_pages: 1,
      },
      trustBarItems: [],
      aboutSection: {},
      examsPageHeading: "All Popular Exams",
    };
  }
});

// ------------------ Dynamic Metadata ------------------
export async function generateMetadata() {
  try {
    const seoData = await fetchExamsPageSeo();
    if (!seoData) throw new Error("SEO fetch failed");

    const title = seoData?.meta_title
      ? `${seoData.meta_title} | All Exam Questions`
      : "Exams | All Exam Questions";

    const description =
      seoData?.meta_description || "Explore all exams on All Exam Questions platform.";

    const image =
      seoData?.meta_image || "https://allexamquestions.com/alleq_logo.png";

    return {
      title,
      description,
      keywords: seoData?.meta_keywords || "",
      metadataBase: new URL("https://allexamquestions.com"),
      alternates: {
        canonical: "/exams",
      },
      openGraph: {
        title,
        description,
        url: "https://allexamquestions.com/exams",
        type: "website",
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  } catch (error) {
    return {
      title: "Exams | All Exam Questions",
      description: "Explore all exams on All Exam Questions platform.",
      metadataBase: new URL("https://allexamquestions.com"),
      alternates: {
        canonical: "/exams",
      },
    };
  }
}

// ------------------ Page Component ------------------
export default async function ExamsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const data = await fetchData(resolvedSearchParams || {});

  return (
    <>
      <BreadcrumbJsonLd items={toBreadcrumbJsonLdItems(EXAMS_BREADCRUMB_ITEMS)} />
      <SiteBreadcrumbBar>
        <SiteBreadcrumbs items={EXAMS_BREADCRUMB_ITEMS} />
      </SiteBreadcrumbBar>
      <ExamsPageContent
      initialProvidersData={data.providers}
      initialCategoriesData={data.categories}
      initialExamsData={data.exams}
      initialExamsPagination={data.examsPagination}
      initialTrustBarData={data.trustBarItems}
      initialAboutData={data.aboutSection}
      initialPageHeading={data.examsPageHeading}
      usePathBasedRouting={false}
      backendPagination={true}
    />
    </>
  );
}