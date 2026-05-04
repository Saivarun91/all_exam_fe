"use client";

import { useEffect } from "react";

export default function FontSettingsProvider({ children }) {
  useEffect(() => {
    // globals.css applies --admin-font-* on html/body; only set variables on :root
    // (avoid querySelectorAll + per-node style — that was very expensive for TBT).
    const applyFontSettings = (family, size) => {
      if (typeof document === "undefined") return;
      const root = document.documentElement;
      let cleanFontFamily = family ? family.trim() : "Poppins";
      cleanFontFamily = cleanFontFamily.replace(/['"]/g, "");
      const cleanFontSize = size ? size.toString().trim() : "16";
      const fontSizePx = cleanFontSize.includes("px")
        ? cleanFontSize
        : `${cleanFontSize}px`;
      root.style.setProperty("--admin-font-family", cleanFontFamily, "important");
      root.style.setProperty("--admin-font-size", fontSizePx, "important");
    };

    const fetchFontSettings = async () => {
      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${API_BASE_URL}/api/settings/public/`);
        const data = await res.json();

        if (data.success) {
          const adminFontFamily = data.font_family || "Poppins";
          const adminFontSize = data.font_size || "16";
          applyFontSettings(adminFontFamily, adminFontSize);
        }
      } catch (err) {
        console.error("Error fetching font settings:", err);
        applyFontSettings("Poppins", "16");
      }
    };

    const runWhenIdle = (cb) => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => cb(), { timeout: 2500 });
      } else {
        window.setTimeout(cb, 1);
      }
    };

    runWhenIdle(fetchFontSettings);

    const handleFontSettingsUpdate = () => {
      runWhenIdle(fetchFontSettings);
    };

    window.addEventListener("fontSettingsUpdated", handleFontSettingsUpdate);

    return () => {
      window.removeEventListener("fontSettingsUpdated", handleFontSettingsUpdate);
    };
  }, []);

  return <>{children}</>;
}

