import { cache } from "react";
import Footer from "./Footer";
import { publicFetchOptions, providersListUrl } from "@/lib/serverRevalidate";
import { fetchPublicBrandSettings } from "@/lib/fetchPublicBrandSettings";
import {
  DEFAULT_FOOTER_SETTINGS,
  normalizeFooterSettings,
} from "@/lib/footerDefaults";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const fetchFooterSettingsSSR = cache(async function fetchFooterSettingsSSR() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/settings/footer/`,
      publicFetchOptions()
    );
    if (!res.ok) return normalizeFooterSettings(DEFAULT_FOOTER_SETTINGS);
    const json = await res.json();
    if (!json?.success) return normalizeFooterSettings(DEFAULT_FOOTER_SETTINGS);
    return normalizeFooterSettings(json.data || {});
  } catch {
    return normalizeFooterSettings(DEFAULT_FOOTER_SETTINGS);
  }
});

const fetchFooterProviders = cache(async function fetchFooterProviders(limit = 5) {
  try {
    const res = await fetch(providersListUrl(API_BASE_URL), publicFetchOptions());
    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    const safeLimit = Math.max(1, Math.min(20, Number(limit) || 5));
    return data.filter((p) => p.is_active !== false).slice(0, safeLimit);
  } catch {
    return [];
  }
});

export default async function FooterWrapper() {
  const initialFooterSettings = await fetchFooterSettingsSSR();
  const [initialProviders, { logoUrl: initialLogoUrl }] = await Promise.all([
    fetchFooterProviders(initialFooterSettings.providers_limit),
    fetchPublicBrandSettings(),
  ]);
  return (
    <Footer
      initialProviders={initialProviders}
      initialLogoUrl={initialLogoUrl}
      initialFooterSettings={initialFooterSettings}
    />
  );
}
