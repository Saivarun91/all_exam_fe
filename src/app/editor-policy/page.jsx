// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export default function EditorPolicy() {
//   const router = useRouter();
//   const [content, setContent] = useState("");
//   const [metaTitle, setMetaTitle] = useState("");
//   const [metaKeywords, setMetaKeywords] = useState("");
//   const [metaDescription, setMetaDescription] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   const handleBack = () => {
//     if (typeof window !== "undefined") {
//       if (window.history.length > 1) {
//         router.back();
//       } else {
//         router.push("/");
//       }
//     }
//   };

//   useEffect(() => {
//     const fetchEditorPolicy = async () => {
//       try {
//         const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
//         const res = await fetch(`${API_BASE_URL}/api/settings/editor-policy/`);

//         if (!res.ok) {
//           throw new Error("Failed to fetch editor policy");
//         }

//         const result = await res.json();

//         if (result.success) {
//           setContent(result.content || "Editor policy content will be updated by admin.");
//           setMetaTitle(result.meta_title || "");
//           setMetaKeywords(result.meta_keywords || "");
//           setMetaDescription(result.meta_description || "");
//         } else {
//           throw new Error(result.error || "Failed to load editor policy");
//         }

//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching editor policy:", err);
//         setError(true);
//         setLoading(false);
//       }
//     };

//     fetchEditorPolicy();
//   }, []);

//   useEffect(() => {
//     if (typeof window !== "undefined" && !loading) {
//       const title = metaTitle || "Editor Policy - AllExamQuestions | Editorial Guidelines";
//       document.title = title;

//       const description = metaDescription || "Read the AllExamQuestions Editor Policy. Guidelines for content editors, editorial standards, and quality assurance.";
//       let metaDesc = document.querySelector('meta[name="description"]');
//       if (!metaDesc) {
//         metaDesc = document.createElement("meta");
//         metaDesc.setAttribute("name", "description");
//         document.head.appendChild(metaDesc);
//       }
//       metaDesc.setAttribute("content", description);

//       const keywords = metaKeywords || "editor policy, editorial policy, AllExamQuestions, content guidelines, editorial standards";
//       let metaKw = document.querySelector('meta[name="keywords"]');
//       if (!metaKw) {
//         metaKw = document.createElement("meta");
//         metaKw.setAttribute("name", "keywords");
//         document.head.appendChild(metaKw);
//       }
//       metaKw.setAttribute("content", keywords);

//       const canonicalUrl = "https://allexamquestions.com/editor-policy";
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
//             <p className="text-gray-500">Loading editor policy...</p>
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
//             <p className="text-red-500">Failed to load editor policy. Please try again later.</p>
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
//             Editor Policy
//           </h1>
//           <p className="text-muted-foreground text-lg">
//             Editorial guidelines and content standards
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
import Link from "next/link";

// ✅ Force static HTML output
export const dynamic = "force-static";

export async function generateMetadata() {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/settings/editor-policy/`,
      { cache: "force-cache" }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch editor policy");
    }

    const result = await res.json();

    if (result.success) {
      return {
        title:
          result.meta_title ||
          "Editor Policy - AllExamQuestions | Editorial Guidelines",
        description:
          result.meta_description ||
          "Read the AllExamQuestions Editor Policy. Guidelines for content editors, editorial standards, and quality assurance.",
        keywords:
          result.meta_keywords ||
          "editor policy, editorial policy, AllExamQuestions, content guidelines, editorial standards",
        alternates: {
          canonical: "https://allexamquestions.com/editor-policy",
        },
      };
    }
  } catch (error) {
    console.error("Metadata fetch error:", error);
  }

  return {
    title:
      "Editor Policy - AllExamQuestions | Editorial Guidelines",
    description:
      "Read the AllExamQuestions Editor Policy. Guidelines for content editors, editorial standards, and quality assurance.",
    keywords:
      "editor policy, editorial policy, AllExamQuestions, content guidelines, editorial standards",
    alternates: {
      canonical: "https://allexamquestions.com/editor-policy",
    },
  };
}

export default async function EditorPolicy() {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  let content = "";
  let error = false;

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/settings/editor-policy/`,
      { cache: "force-cache" }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch editor policy");
    }

    const result = await res.json();

    if (result.success) {
      content =
        result.content ||
        "Editor policy content will be updated by admin.";
    } else {
      throw new Error(result.error || "Failed to load editor policy");
    }
  } catch (err) {
    console.error("Error fetching editor policy:", err);
    error = true;
  }

  if (error) {
    return (
      <div className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-red-500">
              Failed to load editor policy. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href="/">
          <Button
            variant="ghost"
            className="mb-6 text-foreground hover:text-foreground hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Editor Policy
          </h1>
          <p className="text-muted-foreground text-lg">
            Editorial guidelines and content standards
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