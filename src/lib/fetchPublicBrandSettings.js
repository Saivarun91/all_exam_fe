import { cache } from "react";
import { publicFetchOptions } from "@/lib/serverRevalidate";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export const fetchPublicBrandSettings = cache(
  async function fetchPublicBrandSettings() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/public/`, {
        ...publicFetchOptions(),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return { logoUrl: "", siteName: "" };

      const data = await res.json();
      if (!data.success) return { logoUrl: "", siteName: "" };

      const siteRaw = data.site_name;
      const siteName =
        siteRaw != null && String(siteRaw).trim() ? String(siteRaw).trim() : "";

      return {
        logoUrl: data.logo_url || "",
        siteName,
      };
    } catch {
      return { logoUrl: "", siteName: "" };
    }
  }
);
