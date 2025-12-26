"use client";

import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// Cache for logo URL
let cachedLogoUrl = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useLogoUrl() {
  const [logoUrl, setLogoUrl] = useState(""); // Default to empty (no logo)

  useEffect(() => {
    const fetchLogoUrl = async () => {
      try {
        // Use public endpoint for logo URL (no auth required)
        const res = await fetch(`${API_BASE_URL}/api/settings/public/`);

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const url = data.logo_url || "";
            cachedLogoUrl = url;
            cacheTimestamp = Date.now();
            setLogoUrl(url);
          }
        }
      } catch (err) {
        console.error("Error fetching logo URL:", err);
        // Keep default empty string
      }
    };

    // Check cache first
    const now = Date.now();
    if (cachedLogoUrl !== null && (now - cacheTimestamp) < CACHE_DURATION) {
      setLogoUrl(cachedLogoUrl);
    } else {
      fetchLogoUrl();
    }

    // Listen for logo updates
    const handleLogoUpdate = () => {
      cachedLogoUrl = null;
      cacheTimestamp = 0;
      fetchLogoUrl();
    };

    window.addEventListener('logoUpdated', handleLogoUpdate);
    window.addEventListener('siteNameUpdated', handleLogoUpdate); // Also refresh on site name update

    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdate);
      window.removeEventListener('siteNameUpdated', handleLogoUpdate);
    };
  }, []);

  return logoUrl;
}

// Helper to get logo URL synchronously (returns cached value or empty string)
export function getLogoUrl() {
  return cachedLogoUrl || "";
}

