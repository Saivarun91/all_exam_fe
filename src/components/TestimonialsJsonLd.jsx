/**
 * Testimonials JSON-LD Structured Data Component
 * Renders Schema.org AggregateRating/Review JSON-LD script tag
 */

import { useEffect } from "react";

export default function TestimonialsJsonLd({ testimonials = [] }) {
  useEffect(() => {
    if (!Array.isArray(testimonials) || testimonials.length === 0) {
      return;
    }

    // Filter valid testimonials
    const validTestimonials = testimonials.filter(
      (t) =>
        t &&
        typeof t === "object" &&
        t.name &&
        t.text &&
        typeof t.name === "string" &&
        typeof t.text === "string" &&
        t.name.trim().length > 0 &&
        t.text.trim().length > 0
    );

    if (validTestimonials.length === 0) {
      return;
    }

    // Calculate average rating
    const ratings = validTestimonials
      .map((t) => t.rating || 5)
      .filter((r) => typeof r === "number" && r >= 1 && r <= 5);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 5;

    // Build AggregateRating and Review structured data
    const testimonialsJsonLd = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "AllExamQuestions Certification Practice Tests",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating.toFixed(1),
        reviewCount: validTestimonials.length,
        bestRating: "5",
        worstRating: "1",
      },
      review: validTestimonials.map((testimonial) => ({
        "@type": "Review",
        author: {
          "@type": "Person",
          name: testimonial.name.trim(),
        },
        reviewBody: testimonial.text.trim(),
        reviewRating: {
          "@type": "Rating",
          ratingValue: testimonial.rating || 5,
          bestRating: "5",
          worstRating: "1",
        },
      })),
    };

    // Remove any existing testimonials JSON-LD scripts
    const existingScripts = document.querySelectorAll("#testimonials-json-ld-schema");
    existingScripts.forEach((script) => script.remove());

    // Create and inject script tag into document head
    const script = document.createElement("script");
    script.id = "testimonials-json-ld-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(testimonialsJsonLd);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById("testimonials-json-ld-schema");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [testimonials]);

  return null;
}

