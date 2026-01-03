/**
 * ItemList JSON-LD Structured Data Component
 * Renders Schema.org ItemList JSON-LD script tag for various sections
 */

import { useEffect } from "react";

export default function ItemListJsonLd({ 
  items = [], 
  listName = "", 
  itemType = "ListItem",
  schemaId = "itemlist-json-ld-schema"
}) {
  useEffect(() => {
    if (!Array.isArray(items) || items.length === 0) {
      return;
    }

    // Build ItemList structured data
    const itemListJsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: listName || "Item List",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => {
        const baseItem = {
          "@type": "ListItem",
          position: index + 1,
        };

        // Handle different item types
        if (itemType === "Course" && item.title) {
          return {
            ...baseItem,
            item: {
              "@type": "Course",
              name: item.title,
              description: item.description || item.excerpt || "",
              provider: {
                "@type": "Organization",
                name: item.provider || "AllExamQuestions",
              },
              url: typeof window !== "undefined" 
                ? `${window.location.origin}${item.url || item.slug || ""}`
                : `https://allexamquestions.com${item.url || item.slug || ""}`,
            },
          };
        } else if (itemType === "Category" && item.name) {
          return {
            ...baseItem,
            item: {
              "@type": "Thing",
              name: item.name,
              description: item.description || "",
              url: typeof window !== "undefined"
                ? `${window.location.origin}${item.url || ""}`
                : `https://allexamquestions.com${item.url || ""}`,
            },
          };
        } else if (itemType === "Organization" && item.name) {
          return {
            ...baseItem,
            item: {
              "@type": "Organization",
              name: item.name,
              description: item.description || "",
              url: typeof window !== "undefined"
                ? `${window.location.origin}${item.url || ""}`
                : `https://allexamquestions.com${item.url || ""}`,
            },
          };
        } else if (itemType === "Thing" && item.title) {
          return {
            ...baseItem,
            item: {
              "@type": "Thing",
              name: item.title || item.name,
              description: item.description || "",
            },
          };
        } else {
          // Default ListItem
          return {
            ...baseItem,
            item: {
              "@type": "Thing",
              name: item.name || item.title || `Item ${index + 1}`,
            },
          };
        }
      }),
    };

    // Remove any existing JSON-LD scripts with this ID
    const existingScripts = document.querySelectorAll(`#${schemaId}`);
    existingScripts.forEach((script) => script.remove());

    // Create and inject script tag into document head
    const script = document.createElement("script");
    script.id = schemaId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(itemListJsonLd);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById(schemaId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [items, listName, itemType, schemaId]);

  return null;
}

