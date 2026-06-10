"use client";

import { useState, useEffect } from "react";
import { fetchPublicSettings, clearPublicSettingsCache } from "@/lib/fetchPublicSettings";

export function useSiteName(initialSiteNameFromServer = "") {
  const [siteName, setSiteName] = useState(initialSiteNameFromServer || "");

  useEffect(() => {
    let cancelled = false;

    const loadSiteName = async () => {
      const data = await fetchPublicSettings();
      if (cancelled || !data) return;

      const name =
        data.site_name && String(data.site_name).trim()
          ? String(data.site_name).trim()
          : "";
      if (name) {
        setSiteName(name);
      }
    };

    loadSiteName();

    const handleSiteNameUpdate = () => {
      clearPublicSettingsCache();
      loadSiteName();
    };

    window.addEventListener("siteNameUpdated", handleSiteNameUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener("siteNameUpdated", handleSiteNameUpdate);
    };
  }, [initialSiteNameFromServer]);

  return siteName;
}

export function getSiteName() {
  return "";
}
