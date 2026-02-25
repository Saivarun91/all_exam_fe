// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export default function Disclaimer() {
//   const router = useRouter();
//   const [content, setContent] = useState("");
//   const [metaTitle, setMetaTitle] = useState("");
//   const [metaKeywords, setMetaKeywords] = useState("");
//   const [metaDescription, setMetaDescription] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   const handleBack = () => {
//     if (typeof window !== "undefined") {
//       // Check if there's history to go back to
//       if (window.history.length > 1) {
//         router.back();
//       } else {
//         // Fallback to home page if no history
//         router.push("/");
//       }
//     }
//   };

//   useEffect(() => {
//     const fetchDisclaimer = async () => {
//       try {
//         const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
//         const res = await fetch(`${API_BASE_URL}/api/settings/disclaimer/`);
        
//         if (!res.ok) {
//           throw new Error("Failed to fetch disclaimer");
//         }
        
//         const result = await res.json();
        
//         if (result.success) {
//           setContent(result.content || "Disclaimer content will be updated by admin.");
//           setMetaTitle(result.meta_title || "");
//           setMetaKeywords(result.meta_keywords || "");
//           setMetaDescription(result.meta_description || "");
//         } else {
//           throw new Error(result.error || "Failed to load disclaimer");
//         }
        
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching disclaimer:", err);
//         setError(true);
//         setLoading(false);
//       }
//     };

//     fetchDisclaimer();
//   }, []);

//   // Set SEO meta tags and canonical URL
//   useEffect(() => {
//     if (typeof window !== "undefined" && !loading) {
//       // Set page title (use admin-provided or default)
//       const title = metaTitle || "Disclaimer - AllExamQuestions | Legal Information & Disclaimers";
//       document.title = title;
      
//       // Set meta description (use admin-provided or default)
//       const description = metaDescription || "Read the AllExamQuestions disclaimer. Important legal information about our exam preparation platform, educational content, affiliations, and limitations of liability.";
//       let metaDesc = document.querySelector('meta[name="description"]');
//       if (!metaDesc) {
//         metaDesc = document.createElement("meta");
//         metaDesc.setAttribute("name", "description");
//         document.head.appendChild(metaDesc);
//       }
//       metaDesc.setAttribute("content", description);
      
//       // Set meta keywords (use admin-provided or default)
//       const keywords = metaKeywords || "disclaimer, legal disclaimer, AllExamQuestions disclaimer, exam platform disclaimer, educational disclaimer, liability disclaimer";
//       let metaKw = document.querySelector('meta[name="keywords"]');
//       if (!metaKw) {
//         metaKw = document.createElement("meta");
//         metaKw.setAttribute("name", "keywords");
//         document.head.appendChild(metaKw);
//       }
//       metaKw.setAttribute("content", keywords);
      
//       // Set canonical URL
//       const canonicalUrl = "https://allexamquestions.com/disclaimer";
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
//             <p className="text-gray-500">Loading disclaimer...</p>
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
//             <p className="text-red-500">Failed to load disclaimer. Please try again later.</p>
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
//             Disclaimer
//           </h1>
//           <p className="text-muted-foreground text-lg">
//             Important information and disclaimers
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




import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BackButton from "./BackButton";

// ✅ Force static rendering
export const dynamic = "force-static";

export async function generateMetadata() {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  try {
    const res = await fetch(`${API_BASE_URL}/api/settings/disclaimer/`, {
      cache: "force-cache", // ✅ IMPORTANT CHANGE
    });

    if (!res.ok) {
      throw new Error("Failed to fetch disclaimer");
    }

    const result = await res.json();

    if (result.success) {
      return {
        title:
          result.meta_title ||
          "Disclaimer - AllExamQuestions | Legal Information & Disclaimers",
        description:
          result.meta_description ||
          "Read the AllExamQuestions disclaimer. Important legal information about our exam preparation platform, educational content, affiliations, and limitations of liability.",
        keywords:
          result.meta_keywords ||
          "disclaimer, legal disclaimer, AllExamQuestions disclaimer, exam platform disclaimer, educational disclaimer, liability disclaimer",
        alternates: {
          canonical: "https://allexamquestions.com/disclaimer",
        },
      };
    }
  } catch (error) {
    console.error("Metadata fetch error:", error);
  }

  return {
    title:
      "Disclaimer - AllExamQuestions | Legal Information & Disclaimers",
    description:
      "Read the AllExamQuestions disclaimer. Important legal information about our exam preparation platform, educational content, affiliations, and limitations of liability.",
    keywords:
      "disclaimer, legal disclaimer, AllExamQuestions disclaimer, exam platform disclaimer, educational disclaimer, liability disclaimer",
    alternates: {
      canonical: "https://allexamquestions.com/disclaimer",
    },
  };
}

export default async function Disclaimer() {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  let content = "";
  let error = false;

  try {
    const res = await fetch(`${API_BASE_URL}/api/settings/disclaimer/`, {
      cache: "force-cache", // ✅ IMPORTANT CHANGE
    });

    if (!res.ok) {
      throw new Error("Failed to fetch disclaimer");
    }

    const result = await res.json();

    if (result.success) {
      content =
        result.content ||
        "Disclaimer content will be updated by admin.";
    } else {
      throw new Error(result.error || "Failed to load disclaimer");
    }
  } catch (err) {
    console.error("Error fetching disclaimer:", err);
    error = true;
  }

  if (error) {
    return (
      <div className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-red-500">
              Failed to load disclaimer. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <BackButton />

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Disclaimer
          </h1>
          <p className="text-muted-foreground text-lg">
            Important information and disclaimers
          </p>
        </div>

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
      </div>
    </div>
  );
}