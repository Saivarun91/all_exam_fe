"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function TermsAndConditionsContent() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Remove query parameters from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("from")) {
        // Remove query parameters from URL without reloading
        const cleanUrl = url.pathname;
        window.history.replaceState({}, "", cleanUrl);
      }
    }
  }, []);

  const handleBack = () => {
    if (typeof window !== "undefined") {
      // Check if user came from signup page using sessionStorage
      const fromSignup = sessionStorage.getItem("fromSignup") === "true";
      
      if (fromSignup) {
        // Clear the sessionStorage flag
        sessionStorage.removeItem("fromSignup");
        // Navigate back to signup page
        router.push("/auth/signup");
      } else {
        // Check if there's history to go back to
        if (window.history.length > 1) {
          router.back();
        } else {
          // Fallback to home page if no history
          router.push("/");
        }
      }
    }
  };

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${API_BASE_URL}/api/settings/terms-of-service/`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch terms & conditions");
        }
        
        const result = await res.json();
        console.log(result);
        if (result.success) {
          setContent(result.content || "Terms & conditions content will be updated by admin.");
          setMetaTitle(result.meta_title || "");
          setMetaKeywords(result.meta_keywords || "");
          setMetaDescription(result.meta_description || "");
        } else {
          throw new Error(result.error || "Failed to load terms & conditions");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching terms & conditions:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  // Set SEO meta tags and canonical URL
  useEffect(() => {
    if (typeof window !== "undefined" && !loading) {
      // Set page title (use admin-provided or default)
      const title = metaTitle || "Terms & Conditions - AllExamQuestions | User Agreement & Terms of Service";
      document.title = title;
      
      // Set meta description (use admin-provided or default)
      const description = metaDescription || "Review AllExamQuestions Terms & Conditions. Understand your rights, responsibilities, and the terms of service when using our exam preparation platform and practice tests.";
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);
      
      // Set meta keywords (use admin-provided or default)
      const keywords = metaKeywords || "terms and conditions, terms of service, user agreement, legal terms, AllExamQuestions terms, exam platform terms, service agreement";
      let metaKw = document.querySelector('meta[name="keywords"]');
      if (!metaKw) {
        metaKw = document.createElement("meta");
        metaKw.setAttribute("name", "keywords");
        document.head.appendChild(metaKw);
      }
      metaKw.setAttribute("content", keywords);
      
      // Set canonical URL
      const canonicalUrl = "https://allexamquestions.com/terms-and-conditions";
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", canonicalUrl);
    }
  }, [metaTitle, metaKeywords, metaDescription, loading]);

  if (loading) {
    return (
      <div className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-500">Loading terms & conditions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-red-500">Failed to load terms & conditions. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6 text-foreground hover:text-foreground hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground text-lg">
            Please read our terms and conditions carefully
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

export default function TermsAndConditions() {
  return (
    <Suspense fallback={
      <div className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <TermsAndConditionsContent />
    </Suspense>
  );
}

