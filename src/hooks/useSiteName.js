"use client";

import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// Cache for site name
let cachedSiteName = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useSiteName() {
  const [siteName, setSiteName] = useState(""); // Start with empty string

  useEffect(() => {
    const fetchSiteName = async () => {
      try {
        // Use public endpoint for site name (no auth required)
        const res = await fetch(`${API_BASE_URL}/api/settings/public/`);

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            // Use site_name if it exists and is not empty, otherwise use empty string
            const name = (data.site_name && data.site_name.trim()) ? data.site_name.trim() : "";
            cachedSiteName = name;
            cacheTimestamp = Date.now();
            setSiteName(name);
          } else {
            // If API call failed, set to empty string
            cachedSiteName = "";
            setSiteName("");
          }
        } else {
          // If response not ok, set to empty string
          cachedSiteName = "";
          setSiteName("");
        }
      } catch (err) {
        console.error("Error fetching site name:", err);
        // Keep empty string on error
        cachedSiteName = "";
        setSiteName("");
      }
    };

    // Check cache first
    const now = Date.now();
    if (cachedSiteName !== null && (now - cacheTimestamp) < CACHE_DURATION) {
      setSiteName(cachedSiteName);
    } else {
      fetchSiteName();
    }

    // Listen for site name updates
    const handleSiteNameUpdate = () => {
      cachedSiteName = null;
      cacheTimestamp = 0;
      fetchSiteName();
    };

    window.addEventListener('siteNameUpdated', handleSiteNameUpdate);

    return () => {
      window.removeEventListener('siteNameUpdated', handleSiteNameUpdate);
    };
  }, []);

  return siteName;
}

// Helper to get site name synchronously (returns cached value or empty string)
export function getSiteName() {
  return cachedSiteName || "";
}

