// /**
//  * Rating JSON-LD Structured Data Component
//  * Renders Schema.org AggregateRating JSON-LD script tag for ratings
//  * This component dynamically updates when rating data changes
//  */

// import { useEffect } from "react";

// export default function RatingJsonLd({ 
//   rating, 
//   reviewCount, 
//   itemName, 
//   itemType = "Product",
//   bestRating = 5,
//   worstRating = 1,
//   schemaId = "rating-json-ld-schema"
// }) {
//   useEffect(() => {
//     // Validate rating data
//     if (!rating || rating === null || rating === undefined) {
//       return;
//     }

//     // Convert rating to number if it's a string
//     const ratingValue = typeof rating === 'string' ? parseFloat(rating) : rating;
    
//     // Validate rating value
//     if (isNaN(ratingValue) || ratingValue < worstRating || ratingValue > bestRating) {
//       return;
//     }

//     // Build AggregateRating structured data according to Schema.org
//     const ratingJsonLd = {
//       "@context": "https://schema.org",
//       "@type": itemType,
//       ...(itemName && { name: itemName }),
//       aggregateRating: {
//         "@type": "AggregateRating",
//         ratingValue: ratingValue.toFixed(1),
//         bestRating: bestRating,
//         worstRating: worstRating,
//         ...(reviewCount !== null && reviewCount !== undefined && reviewCount > 0 && {
//           reviewCount: reviewCount
//         })
//       }
//     };

//     // Remove any existing rating JSON-LD scripts with the same ID
//     const existingScripts = document.querySelectorAll(`#${schemaId}`);
//     existingScripts.forEach((script) => script.remove());

//     // Create and inject script tag into document head
//     const script = document.createElement("script");
//     script.id = schemaId;
//     script.type = "application/ld+json";
//     script.textContent = JSON.stringify(ratingJsonLd);
//     document.head.appendChild(script);

//     // Cleanup function to remove script when component unmounts or data changes
//     return () => {
//       const scriptToRemove = document.getElementById(schemaId);
//       if (scriptToRemove) {
//         scriptToRemove.remove();
//       }
//     };
//   }, [rating, reviewCount, itemName, itemType, bestRating, worstRating, schemaId]);

//   // Component doesn't render anything visible - script is injected into head
//   return null;
// }


/**
 * Rating JSON-LD Structured Data Component
 * Server Component version (SSR compatible)
 * Renders Schema.org AggregateRating JSON-LD directly in HTML
 */

export default function RatingJsonLd({
  rating,
  reviewCount,
  itemName,
  itemType = "Product",
  bestRating = 5,
  worstRating = 1,
  schemaId = "rating-json-ld-schema",
}) {
  // Validate rating
  if (rating === null || rating === undefined) return null;

  const ratingValue =
    typeof rating === "string" ? parseFloat(rating) : rating;

  if (
    isNaN(ratingValue) ||
    ratingValue < worstRating ||
    ratingValue > bestRating
  ) {
    return null;
  }

  const ratingJsonLd = {
    "@context": "https://schema.org",
    "@type": itemType,
    ...(itemName && { name: itemName }),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: ratingValue.toFixed(1),
      bestRating: bestRating,
      worstRating: worstRating,
      ...(reviewCount &&
        reviewCount > 0 && { reviewCount: reviewCount }),
    },
  };

  return (
    <script
      id={schemaId}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(ratingJsonLd),
      }}
    />
  );
}