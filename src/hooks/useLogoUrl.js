"use client";

import { useState, useEffect } from "react";
import { fetchPublicSettings, clearPublicSettingsCache } from "@/lib/fetchPublicSettings";

export function useLogoUrl(initialLogoFromServer = "") {
  const [logoUrl, setLogoUrl] = useState(initialLogoFromServer || "");

  useEffect(() => {
    let cancelled = false;

    const loadLogo = async () => {
      const data = await fetchPublicSettings();
      if (cancelled || !data) return;
      if (data.logo_url) {
        setLogoUrl(data.logo_url);
      }
    };

    loadLogo();

    const handleLogoUpdate = () => {
      clearPublicSettingsCache();
      loadLogo();
    };

    window.addEventListener("logoUpdated", handleLogoUpdate);
    window.addEventListener("siteNameUpdated", handleLogoUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener("logoUpdated", handleLogoUpdate);
      window.removeEventListener("siteNameUpdated", handleLogoUpdate);
    };
  }, [initialLogoFromServer]);

  return logoUrl;
}

export function getLogoUrl() {
  return "";
}
