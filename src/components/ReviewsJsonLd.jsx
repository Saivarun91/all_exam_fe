/**
 * Reviews JSON-LD Structured Data Component
 * Renders Schema.org AggregateRating JSON-LD script tag
 */

import { useEffect } from "react";

export default function ReviewsJsonLd({ testimonials, itemName }) {
  useEffect(() => {
    if (!testimonials || !Array.isArray(testimonials) || testimonials.length === 0) {
      return;
    }

    // Filter valid testimonials with ratings
    const validReviews = testimonials.filter(
      (t) =>
        t &&
        (t.rating !== undefined && t.rating !== null) &&
        (t.review || t.text || t.comment)
    );

    if (validReviews.length === 0) return;

    // Calculate aggregate rating
    const totalRating = validReviews.reduce((sum, t) => sum + (t.rating || 5), 0);
    const averageRating = totalRating / validReviews.length;
    const reviewCount = validReviews.length;

    // Build review data
    const reviews = validReviews.map((testimonial) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: testimonial.name || "Anonymous",
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: testimonial.rating || 5,
        bestRating: 5,
      },
      datePublished: testimonial.created_at || new Date().toISOString(),
      reviewBody: testimonial.review || testimonial.text || testimonial.comment || "",

    }));

    const reviewsJsonLd = {
      "@context": "https://schema.org",
      "@type": "Course" ,
      ...(itemName && { name: itemName }),
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating.toFixed(1),
        reviewCount: reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
      review: reviews,
    };

    // Remove any existing reviews JSON-LD scripts
    const existingScripts = document.querySelectorAll("#reviews-json-ld-schema");
    existingScripts.forEach((script) => script.remove());

    // Create and inject script tag into document head
    const script = document.createElement("script");
    script.id = "reviews-json-ld-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(reviewsJsonLd);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById("reviews-json-ld-schema");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [testimonials, itemName]);

  return null;
}

