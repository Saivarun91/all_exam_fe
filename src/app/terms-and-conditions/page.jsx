// "use client";

// import { useEffect, useState, Suspense } from "react";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";

// function TermsAndConditionsContent() {
//   const router = useRouter();
//   const [content, setContent] = useState("");
//   const [metaTitle, setMetaTitle] = useState("");
//   const [metaKeywords, setMetaKeywords] = useState("");
//   const [metaDescription, setMetaDescription] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   // Remove query parameters from URL on mount
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const url = new URL(window.location.href);
//       if (url.searchParams.has("from")) {
//         // Remove query parameters from URL without reloading
//         const cleanUrl = url.pathname;
//         window.history.replaceState({}, "", cleanUrl);
//       }
//     }
//   }, []);

//   const handleBack = () => {
//     if (typeof window !== "undefined") {
//       // Check if user came from signup page using sessionStorage
//       const fromSignup = sessionStorage.getItem("fromSignup") === "true";
      
//       if (fromSignup) {
//         // Clear the sessionStorage flag
//         sessionStorage.removeItem("fromSignup");
//         // Navigate back to signup page
//         router.push("/auth/signup");
//       } else {
//         // Check if there's history to go back to
//         if (window.history.length > 1) {
//           router.back();
//         } else {
//           // Fallback to home page if no history
//           router.push("/");
//         }
//       }
//     }
//   };

//   useEffect(() => {
//     const fetchTerms = async () => {
//       try {
//         const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
//         const res = await fetch(`${API_BASE_URL}/api/settings/terms-of-service/`);
        
//         if (!res.ok) {
//           throw new Error("Failed to fetch terms & conditions");
//         }
        
//         const result = await res.json();
//         console.log(result);
//         if (result.success) {
//           setContent(result.content || "Terms & conditions content will be updated by admin.");
//           setMetaTitle(result.meta_title || "");
//           setMetaKeywords(result.meta_keywords || "");
//           setMetaDescription(result.meta_description || "");
//         } else {
//           throw new Error(result.error || "Failed to load terms & conditions");
//         }
        
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching terms & conditions:", err);
//         setError(true);
//         setLoading(false);
//       }
//     };

//     fetchTerms();
//   }, []);

//   // Set SEO meta tags and canonical URL
//   useEffect(() => {
//     if (typeof window !== "undefined" && !loading) {
//       // Set page title (use admin-provided or default)
//       const title = metaTitle || "Terms & Conditions - AllExamQuestions | User Agreement & Terms of Service";
//       document.title = title;
      
//       // Set meta description (use admin-provided or default)
//       const description = metaDescription || "Review AllExamQuestions Terms & Conditions. Understand your rights, responsibilities, and the terms of service when using our exam preparation platform and practice tests.";
//       let metaDesc = document.querySelector('meta[name="description"]');
//       if (!metaDesc) {
//         metaDesc = document.createElement("meta");
//         metaDesc.setAttribute("name", "description");
//         document.head.appendChild(metaDesc);
//       }
//       metaDesc.setAttribute("content", description);
      
//       // Set meta keywords (use admin-provided or default)
//       const keywords = metaKeywords || "terms and conditions, terms of service, user agreement, legal terms, AllExamQuestions terms, exam platform terms, service agreement";
//       let metaKw = document.querySelector('meta[name="keywords"]');
//       if (!metaKw) {
//         metaKw = document.createElement("meta");
//         metaKw.setAttribute("name", "keywords");
//         document.head.appendChild(metaKw);
//       }
//       metaKw.setAttribute("content", keywords);
      
//       // Set canonical URL
//       const canonicalUrl = "https://allexamquestions.com/terms-and-conditions";
//       let canonicalLink = document.querySelector('link[rel="canonical"]');
//       if (!canonicalLink) {
//         canonicalLink = document.createElement("link");
//         canonicalLink.setAttribute("rel", "canonical");
//         document.head.appendChild(canonicalLink);
//       }
//       canonicalLink.setAttribute("href", canonicalUrl);
//     }
//   }, [metaTitle, metaKeywords, metaDescription, loading]);

//   if (loading) {
//     return (
//       <div className="py-16 bg-background">
//         <div className="container mx-auto px-4 max-w-5xl">
//           <div className="flex items-center justify-center min-h-[400px]">
//             <p className="text-gray-500">Loading terms & conditions...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="py-16 bg-background">
//         <div className="container mx-auto px-4 max-w-5xl">
//           <div className="flex items-center justify-center min-h-[400px]">
//             <p className="text-red-500">Failed to load terms & conditions. Please try again later.</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="py-16 bg-background">
//       <div className="container mx-auto px-4 max-w-5xl">
//         <Button
//           variant="ghost"
//           onClick={handleBack}
//           className="mb-6 text-foreground hover:text-foreground hover:bg-gray-100"
//         >
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back
//         </Button>
//         <div className="text-center mb-12">
//           <h1 className="text-5xl font-bold mb-4 text-foreground">
//             Terms & Conditions
//           </h1>
//           <p className="text-muted-foreground text-lg">
//             Please read our terms and conditions carefully
//           </p>
//         </div>

//         <div className="prose prose-lg max-w-none">
//           <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
//             {content && content.trim().startsWith("<") ? (
//               <div
//                 className="text-foreground leading-relaxed text-base tiptap-editor-content prose prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0"
//                 dangerouslySetInnerHTML={{ __html: content }}
//               />
//             ) : (
//               <div className="text-foreground whitespace-pre-wrap leading-relaxed text-base">
//                 {content}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function TermsAndConditions() {
//   return (
//     <Suspense fallback={
//       <div className="py-16 bg-background">
//         <div className="container mx-auto px-4 max-w-5xl">
//           <div className="flex items-center justify-center min-h-[400px]">
//             <p className="text-gray-500">Loading...</p>
//           </div>
//         </div>
//       </div>
//     }>
//       <TermsAndConditionsContent />
//     </Suspense>
//   );
// }





// import BackButton from "./BackButton";


// export const dynamic = "force-dynamic"; // important for fresh fetch

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// export async function generateMetadata() {
//   try {
//     const res = await fetch(`${API_BASE_URL}/api/settings/terms-of-service/`, {
//       cache: "no-store", // always fetch fresh metadata
//       next: { revalidate: 0 }, // optional: force no caching
//     });

//     const result = await res.json();

//     // Ensure the API returns meta_title, meta_description, meta_keywords
//     if (result.success) {
//       return {
//         title: result.meta_title || "Terms & Conditions",        // browser tab
//         description: result.meta_description || "",              // meta description
//         keywords: result.meta_keywords || "",                    // meta keywords
//         alternates: {
//           canonical: "https://allexamquestions.com/terms-and-conditions",
//         },
//       };
//     }

//     // fallback if success=false
//     return {
//       title: "Terms & Conditions",
//       description: "",
//       keywords: "",
//       alternates: {
//         canonical: "https://allexamquestions.com/terms-and-conditions",
//       },
//     };
//   } catch (err) {
//     console.error("Failed to fetch metadata:", err);
//     return {
//       title: "Terms & Conditions",
//       description: "",
//       keywords: "",
//       alternates: {
//         canonical: "https://allexamquestions.com/terms-and-conditions",
//       },
//     };
//   }
// }


// export default async function TermsAndConditionsPage() {
//   const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
//   let content = "";
//   let error = false;
//   try {
//     const res = await fetch(`${API_BASE_URL}/api/settings/terms-of-service/`, {
//       cache: "no-store",
//     });
//     const result = await res.json();
//     if (result.success) {
//       content = result.content || "Terms & conditions content will be updated by admin.";
//     } else {
//       error = true;
//     }
//   } catch (err) {
//     console.error("Error fetching terms & conditions:", err);
//     error = true;
//   }

//   return (
//     <div className="py-16 bg-background">
//       <div className="container mx-auto px-4 max-w-5xl">
//         <BackButton />

//         <div className="text-center mb-12">
//           <h1 className="text-5xl font-bold mb-4 text-foreground">
//             Terms & Conditions
//           </h1>
//           <p className="text-muted-foreground text-lg">
//             Please read our terms and conditions carefully
//           </p>
//         </div>

//         {error ? (
//           <div className="flex items-center justify-center min-h-[400px]">
//             <p className="text-red-500">
//               Failed to load terms & conditions. Please try again later.
//             </p>
//           </div>
//         ) : (
//           <div className="prose prose-lg max-w-none">
//             <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
//               <div
//                 className="text-foreground leading-relaxed text-base tiptap-editor-content prose prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0"
//                 dangerouslySetInnerHTML={{ __html: content }}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }





import BackButton from "./BackButton";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// Fetch Terms & Conditions from API
async function getTermsAndConditions() {
  const res = await fetch(`${API_BASE_URL}/api/settings/terms-of-service/`, {
    cache: "no-store", // always fetch fresh data
  });
  if (!res.ok) throw new Error("Failed to fetch Terms & Conditions");
  return res.json();
}

// Force dynamic rendering (not statically generated)
export const dynamic = "force-dynamic";

// Generate dynamic metadata for this page
export async function generateMetadata() {
  try {
    const data = await getTermsAndConditions();
    return {
      // title: data.meta_title + " | All Exam Questions" || "",
      title: data.meta_title?.trim()
        ? `${data.meta_title.trim()} | All Exam Questions`
        : "Terms and Conditions | All Exam Questions",
      description: data.meta_description || "",
      keywords: data.meta_keywords || "",
      alternates: {
        canonical: "https://allexamquestions.com/terms-and-conditions",
      },
    };
  } catch (err) {
    console.error("Error fetching metadata:", err);
    return {
      title: "Terms & Conditions",
      description: "",
      keywords: "",
    };
  }
}

// Page component
export default async function TermsAndConditions() {
  const data = await getTermsAndConditions();

  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <BackButton />
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Terms & Conditions</h1>
        </div>
        <div className="prose prose-lg max-w-none">
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            <div
              className="text-foreground leading-relaxed text-base tiptap-editor-content prose prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0"
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}