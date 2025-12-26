/**
 * FAQ JSON-LD Structured Data Component
 * Renders Schema.org FAQPage JSON-LD script tag in document head
 */

import { useEffect } from "react";

export default function FAQJsonLd({ faqs = [] }) {
  useEffect(() => {
    // Validate FAQs
    if (!Array.isArray(faqs) || faqs.length === 0) {
      return;
    }

    // Filter valid FAQs (must have question and answer)
    const validFAQs = faqs.filter(
      (faq) =>
        faq &&
        typeof faq === "object" &&
        faq.question &&
        faq.answer &&
        typeof faq.question === "string" &&
        typeof faq.answer === "string" &&
        faq.question.trim().length > 0 &&
        faq.answer.trim().length > 0
    );

    // Don't render if no valid FAQs
    if (validFAQs.length === 0) {
      return;
    }

    // Build FAQPage structured data according to Schema.org
    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: validFAQs.map((faq) => ({
        "@type": "Question",
        name: faq.question.trim(),
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer.trim(),
        },
      })),
    };

    // Remove any existing FAQ JSON-LD scripts
    const existingScripts = document.querySelectorAll('#faq-json-ld-schema');
    existingScripts.forEach(script => script.remove());

    // Create and inject script tag into document head
    const script = document.createElement("script");
    script.id = "faq-json-ld-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(faqJsonLd);
    document.head.appendChild(script);

    // Cleanup function to remove script when component unmounts or FAQs change
    return () => {
      const scriptToRemove = document.getElementById("faq-json-ld-schema");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [faqs]);

  // Component doesn't render anything visible - script is injected into head
  return null;
}
