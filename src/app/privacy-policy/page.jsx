// "use client";

// import { useEffect, useState, Suspense } from "react";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";

// function PrivacyPolicyContent() {
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
//     const fetchPrivacyPolicy = async () => {
//       try {
//         const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
//         const res = await fetch(`${API_BASE_URL}/api/settings/privacy-policy/`);
        
//         if (!res.ok) {
//           throw new Error("Failed to fetch privacy policy");
//         }
        
//         const result = await res.json();
        
//         if (result.success) {
//           setContent(result.content || "Privacy policy content will be updated by admin.");
//           setMetaTitle(result.meta_title || "");
//           setMetaKeywords(result.meta_keywords || "");
//           setMetaDescription(result.meta_description || "");
//         } else {
//           throw new Error(result.error || "Failed to load privacy policy");
//         }
        
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching privacy policy:", err);
//         setError(true);
//         setLoading(false);
//       }
//     };

//     fetchPrivacyPolicy();
//   }, []);

//   // Set SEO meta tags and canonical URL for Privacy Policy page
//   useEffect(() => {
//     if (typeof window !== "undefined" && !loading) {
//       // Set page title (use admin-provided or default)
//       const title = metaTitle || "Privacy Policy - AllExamQuestions | Data Protection & Privacy";
//       document.title = title;
      
//       // Set meta description (use admin-provided or default)
//       const description = metaDescription || "Read our comprehensive Privacy Policy to understand how AllExamQuestions collects, uses, and protects your personal information. Learn about data security, user rights, and our commitment to privacy.";
//       let metaDesc = document.querySelector('meta[name="description"]');
//       if (!metaDesc) {
//         metaDesc = document.createElement("meta");
//         metaDesc.setAttribute("name", "description");
//         document.head.appendChild(metaDesc);
//       }
//       metaDesc.setAttribute("content", description);
      
//       // Set meta keywords (use admin-provided or default)
//       const keywords = metaKeywords || "privacy policy, data protection, user privacy, personal information, data security, GDPR, privacy rights, AllExamQuestions privacy, exam preparation privacy";
//       let metaKw = document.querySelector('meta[name="keywords"]');
//       if (!metaKw) {
//         metaKw = document.createElement("meta");
//         metaKw.setAttribute("name", "keywords");
//         document.head.appendChild(metaKw);
//       }
//       metaKw.setAttribute("content", keywords);
      
//       // Set canonical URL
//       const canonicalUrl = "https://allexamquestions.com/privacy-policy";
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
//             <p className="text-gray-500">Loading privacy policy...</p>
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
//             <p className="text-red-500">Failed to load privacy policy. Please try again later.</p>
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
//             Privacy Policy
//           </h1>
//           <p className="text-muted-foreground text-lg">
//             Your privacy is important to us
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

// export default function PrivacyPolicy() {
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
//       <PrivacyPolicyContent />
//     </Suspense>
//   );
// }




import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BackButton from "./BackButton";

// Helper function to fetch privacy policy from API
async function fetchPrivacyPolicy() {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
    const res = await fetch(`${API_BASE_URL}/api/settings/privacy-policy/`, {
      // Next.js caching options for SSR
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch privacy policy");
    }

    const result = await res.json();

    if (result.success) {
      return {
        content: result.content || "Privacy policy content will be updated by admin.",
        metaTitle: result.meta_title || "",
        metaKeywords: result.meta_keywords || "",
        metaDescription: result.meta_description || "",
      };
    } else {
      throw new Error(result.error || "Failed to load privacy policy");
    }
  } catch (err) {
    console.error("Error fetching privacy policy:", err);
    return {
      content: null,
      metaTitle: "",
      metaKeywords: "",
      metaDescription: "",
      error: true,
    };
  }
}

export const metadata = {
  title: "Privacy Policy - AllExamQuestions | Data Protection & Privacy",
  description:
    "Read our comprehensive Privacy Policy to understand how AllExamQuestions collects, uses, and protects your personal information. Learn about data security, user rights, and our commitment to privacy.",
  keywords:
    "privacy policy, data protection, user privacy, personal information, data security, GDPR, privacy rights, AllExamQuestions privacy, exam preparation privacy",
  alternates: {
    canonical: "https://allexamquestions.com/privacy-policy",
  },
};

export default async function PrivacyPolicyPage() {
  const { content, error } = await fetchPrivacyPolicy();

  // Override metadata if admin provides
  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back Button - This will work client-side via plain JS */}
        <BackButton />

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">
            Your privacy is important to us
          </p>
        </div>

        {error ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-red-500">Failed to load privacy policy. Please try again later.</p>
          </div>
        ) : (
          <div className="prose prose-lg max-w-none">
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
              {content && content.trim().startsWith("<") ? (
                <div
                  className="text-foreground leading-relaxed text-base tiptap-editor-content prose prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <div className="text-foreground whitespace-pre-wrap leading-relaxed text-base">
                  {content}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}