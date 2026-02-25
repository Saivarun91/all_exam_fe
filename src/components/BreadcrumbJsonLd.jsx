// /**
//  * Breadcrumb JSON-LD Structured Data Component
//  * Renders Schema.org BreadcrumbList JSON-LD script tag
//  */

// import { useEffect } from "react";

// export default function BreadcrumbJsonLd({ items = [] }) {
//   useEffect(() => {
//     if (!Array.isArray(items) || items.length === 0) {
//       return;
//     }

//     // Filter valid breadcrumb items
//     const validItems = items.filter(
//       (item) =>
//         item &&
//         typeof item === "object" &&
//         item.name &&
//         typeof item.name === "string" &&
//         item.name.trim().length > 0
//     );

//     if (validItems.length === 0) {
//       return;
//     }

//     // Build base URL
//     const baseUrl =
//       typeof window !== "undefined"
//         ? window.location.origin
//         : "https://allexamquestions.com";

//     // Build BreadcrumbList structured data according to Schema.org
//     const breadcrumbJsonLd = {
//       "@context": "https://schema.org",
//       "@type": "BreadcrumbList",
//       itemListElement: validItems.map((item, index) => ({
//         "@type": "ListItem",
//         position: index + 1,
//         name: item.name.trim(),
//         item: item.url
//           ? item.url.startsWith("http")
//             ? item.url
//             : `${baseUrl}${item.url}`
//           : index === validItems.length - 1
//           ? typeof window !== "undefined"
//             ? window.location.href.split("#")[0]
//             : `${baseUrl}${window.location.pathname}`
//           : `${baseUrl}${item.url || "/"}`,
//       })),
//     };

//     // Remove any existing breadcrumb JSON-LD scripts
//     const existingScripts = document.querySelectorAll("#breadcrumb-json-ld-schema");
//     existingScripts.forEach((script) => script.remove());

//     // Create and inject script tag into document head
//     const script = document.createElement("script");
//     script.id = "breadcrumb-json-ld-schema";
//     script.type = "application/ld+json";
//     script.textContent = JSON.stringify(breadcrumbJsonLd);
//     document.head.appendChild(script);

//     // Cleanup function
//     return () => {
//       const scriptToRemove = document.getElementById("breadcrumb-json-ld-schema");
//       if (scriptToRemove) {
//         scriptToRemove.remove();
//       }
//     };
//   }, [items]);

//   return null;
// }



/**
 * Breadcrumb JSON-LD Structured Data Component (Server Component)
 * Renders Schema.org BreadcrumbList JSON-LD script tag
 */

export default function BreadcrumbJsonLd({ items = [], currentUrl }) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  // Filter valid breadcrumb items
  const validItems = items.filter(
    (item) =>
      item &&
      typeof item === "object" &&
      item.name &&
      typeof item.name === "string" &&
      item.name.trim().length > 0
  );

  if (validItems.length === 0) {
    return null;
  }

  // Base URL for relative links
  const baseUrl = "https://allexamquestions.com";

  // Build BreadcrumbList structured data according to Schema.org
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: validItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name.trim(),
      item:
        item.url?.startsWith("http") ?
        item.url :
        `${baseUrl}${item.url || (index === validItems.length - 1 ? currentUrl || "/" : "/")}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
    />
  );
}