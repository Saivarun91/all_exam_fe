"use client";

import { useEffect } from "react";
import { fetchPublicSettings, clearPublicSettingsCache } from "@/lib/fetchPublicSettings";

export default function FontSettingsProvider({ children }) {
  useEffect(() => {
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

    const loadFontSettings = async () => {
      const data = await fetchPublicSettings();
      if (data?.success) {
        applyFontSettings(data.font_family || "Poppins", data.font_size || "16");
      } else {
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

    runWhenIdle(loadFontSettings);

    const handleFontSettingsUpdate = () => {
      clearPublicSettingsCache();
      runWhenIdle(loadFontSettings);
    };

    window.addEventListener("fontSettingsUpdated", handleFontSettingsUpdate);

    return () => {
      window.removeEventListener("fontSettingsUpdated", handleFontSettingsUpdate);
    };
  }, []);

  return <>{children}</>;
}
