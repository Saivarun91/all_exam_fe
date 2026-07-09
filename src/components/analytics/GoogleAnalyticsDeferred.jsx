"use client";

import { useEffect } from "react";
import { usePathname } from "@/lib/navigation/client";

const GA_MEASUREMENT_ID = "G-4KCPVHB725";

/**
 * Loads GA/gtag after idle time so it does not compete with LCP / main-thread work.
 * Same measurement ID and anonymize_ip as the previous Footer Script setup.
 * Skips /admin (Footer is not shown there today; keep analytics off admin).
 */
export default function GoogleAnalyticsDeferred() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (pathname?.startsWith("/admin")) return undefined;

    const inject = () => {
      const existing = document.querySelector(
        `script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`
      );
      if (existing) return;

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      if (!window.gtag) {
        window.gtag = function gtag() {
          window.dataLayer.push(arguments);
        };
      }
      window.gtag("js", new Date());
      window.gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
    };

    let handle;
    if (typeof window.requestIdleCallback === "function") {
      handle = window.requestIdleCallback(inject, { timeout: 5000 });
      return () => window.cancelIdleCallback?.(handle);
    }
    handle = window.setTimeout(inject, 3500);
    return () => window.clearTimeout(handle);
  }, [pathname]);

  return null;
}
