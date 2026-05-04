// src/components/home/ScrollHandler.jsx
"use client";

import { useEffect } from "react";

/**
 * Handles hash links on direct navigation (e.g. /#faq) without blocking the main thread.
 * Does not attach global scroll listeners.
 */
export default function ScrollHandler() {
  useEffect(() => {
    const navigationType =
      typeof window !== "undefined" &&
      window.performance?.getEntriesByType?.("navigation")?.[0]?.type;
    const isBackForward = navigationType === "back_forward";
    const hash = window.location.hash;

    if (hash && !isBackForward) {
      const scrollToSection = () => {
        const id = hash.substring(1);
        if (!id) return;
        const element = document.getElementById(id);
        if (element) {
          const headerHeight = window.innerWidth >= 768 ? 80 : 64;
          const elementPosition =
            element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerHeight;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        } else {
          setTimeout(scrollToSection, 100);
        }
      };

      const schedule =
        typeof window !== "undefined" && "requestIdleCallback" in window
          ? (fn) => window.requestIdleCallback(fn, { timeout: 2000 })
          : (fn) => window.setTimeout(fn, 0);

      schedule(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(scrollToSection, 300);
          });
        });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
      if (hash && isBackForward) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, []);

  return null;
}
