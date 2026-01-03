"use client";

import { useEffect, useState } from "react";

export default function FontSettingsProvider({ children }) {
  const [fontFamily, setFontFamily] = useState("Poppins");
  const [fontSize, setFontSize] = useState("16");

  useEffect(() => {
    // Fetch font settings from public API
    const fetchFontSettings = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${API_BASE_URL}/api/settings/public/`);
        const data = await res.json();
        
        if (data.success) {
          const adminFontFamily = data.font_family || "Poppins";
          const adminFontSize = data.font_size || "16";
          
          setFontFamily(adminFontFamily);
          setFontSize(adminFontSize);
          
          // Apply font settings to document
          applyFontSettings(adminFontFamily, adminFontSize);
        }
      } catch (err) {
        console.error("Error fetching font settings:", err);
        // Use defaults if API fails
        applyFontSettings("Poppins", "16");
      }
    };

    // Apply font settings function
    const applyFontSettings = (family, size) => {
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        
        // Clean and validate font family (trim whitespace, remove quotes if present)
        let cleanFontFamily = family ? family.trim() : 'Poppins';
        cleanFontFamily = cleanFontFamily.replace(/['"]/g, ''); // Remove quotes if any
        
        // Validate and set font size
        const cleanFontSize = size ? size.toString().trim() : '16';
        const fontSizePx = cleanFontSize.includes('px') ? cleanFontSize : `${cleanFontSize}px`;
        
        // Set CSS variables (these are used by globals.css) - with !important flag
        root.style.setProperty("--admin-font-family", cleanFontFamily, 'important');
        root.style.setProperty("--admin-font-size", fontSizePx, 'important');
        
        // Apply directly to html and body with fallback fonts for immediate effect
        const fontFamilyWithFallback = `${cleanFontFamily}, system-ui, -apple-system, sans-serif`;
        
        // Apply directly to html element
        if (document.documentElement) {
          document.documentElement.style.setProperty('font-family', fontFamilyWithFallback, 'important');
          document.documentElement.style.setProperty('font-size', fontSizePx, 'important');
        }
        
        // Apply directly to body element
        if (document.body) {
          document.body.style.setProperty('font-family', fontFamilyWithFallback, 'important');
          document.body.style.setProperty('font-size', fontSizePx, 'important');
        }
        
        // Apply to all text elements to ensure consistency
        // Use a small delay to ensure DOM is ready
        setTimeout(() => {
          const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, button, input, textarea, select, label, li, td, th, .tiptap-editor-content');
          textElements.forEach((el) => {
            if (el && !el.style.fontFamily.includes(cleanFontFamily)) {
              el.style.setProperty('font-family', fontFamilyWithFallback, 'important');
            }
          });
        }, 100);
      }
    };

    // Initial fetch
    fetchFontSettings();

    // Listen for font settings updates
    const handleFontSettingsUpdate = () => {
      fetchFontSettings();
    };

    window.addEventListener("fontSettingsUpdated", handleFontSettingsUpdate);

    return () => {
      window.removeEventListener("fontSettingsUpdated", handleFontSettingsUpdate);
    };
  }, []);

  return <>{children}</>;
}

