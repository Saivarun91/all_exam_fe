/**
 * Blog JSON-LD Structured Data Component
 * Renders Schema.org BlogPosting JSON-LD script tag
 */

import { useEffect } from "react";

export default function BlogJsonLd({ blog }) {
  useEffect(() => {
    if (!blog) return;

    // Build BlogPosting structured data according to Schema.org
    const blogJsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title || blog.meta_title || "",
      description: blog.meta_description || blog.excerpt || blog.content?.substring(0, 160) || "",
      image: blog.image_url || "",
      datePublished: blog.created_at || new Date().toISOString(),
      dateModified: blog.updated_at || blog.created_at || new Date().toISOString(),
      author: {
        "@type": "Organization",
        name: "AllExamQuestions",
        url: "https://allexamquestions.com",
      },
      publisher: {
        "@type": "Organization",
        name: "AllExamQuestions",
        url: "https://allexamquestions.com",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": typeof window !== "undefined" ? `https://allexamquestions.com${window.location.pathname}` : "",
      },
    };

    // Remove any existing blog JSON-LD scripts
    const existingScripts = document.querySelectorAll("#blog-json-ld-schema");
    existingScripts.forEach((script) => script.remove());

    // Create and inject script tag into document head
    const script = document.createElement("script");
    script.id = "blog-json-ld-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(blogJsonLd);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById("blog-json-ld-schema");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [blog]);

  return null;
}

