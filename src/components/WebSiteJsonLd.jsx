/**
 * WebSite JSON-LD Structured Data Component
 * Renders Schema.org WebSite/Organization JSON-LD script tag
 */

import { useEffect } from "react";

export default function WebSiteJsonLd({ heroData = null, siteName = "AllExamQuestions" }) {
  useEffect(() => {
    const websiteJsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: typeof window !== "undefined" ? window.location.origin : "https://allexamquestions.com",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: typeof window !== "undefined" 
            ? `${window.location.origin}/exams/search/{search_term_string}`
            : "https://allexamquestions.com/exams/search/{search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
      publisher: {
        "@type": "Organization",
        name: siteName,
        url: typeof window !== "undefined" ? window.location.origin : "https://allexamquestions.com",
      },
    };

    // Remove any existing website JSON-LD scripts
    const existingScripts = document.querySelectorAll("#website-json-ld-schema");
    existingScripts.forEach((script) => script.remove());

    // Create and inject script tag into document head
    const script = document.createElement("script");
    script.id = "website-json-ld-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(websiteJsonLd);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById("website-json-ld-schema");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [heroData, siteName]);

  return null;
}

