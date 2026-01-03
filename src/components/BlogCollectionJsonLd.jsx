/**
 * Blog Collection JSON-LD Structured Data Component
 * Renders Schema.org ItemList of BlogPosting JSON-LD script tag
 */

import { useEffect } from "react";

export default function BlogCollectionJsonLd({ articles = [] }) {
  useEffect(() => {
    if (!Array.isArray(articles) || articles.length === 0) {
      return;
    }

    // Build ItemList of BlogPosting structured data
    const blogCollectionJsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Latest Blog Posts",
      numberOfItems: articles.length,
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "BlogPosting",
          headline: article.title || article.meta_title || "",
          description: article.meta_description || article.excerpt || "",
          image: article.image_url || "",
          datePublished: article.created_at || new Date().toISOString(),
          dateModified: article.updated_at || article.created_at || new Date().toISOString(),
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
            "@id": typeof window !== "undefined"
              ? `${window.location.origin}/blog/${article.slug || ""}`
              : `https://allexamquestions.com/blog/${article.slug || ""}`,
          },
        },
      })),
    };

    // Remove any existing blog collection JSON-LD scripts
    const existingScripts = document.querySelectorAll("#blog-collection-json-ld-schema");
    existingScripts.forEach((script) => script.remove());

    // Create and inject script tag into document head
    const script = document.createElement("script");
    script.id = "blog-collection-json-ld-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(blogCollectionJsonLd);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById("blog-collection-json-ld-schema");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [articles]);

  return null;
}

