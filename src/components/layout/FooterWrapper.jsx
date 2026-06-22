import { cache } from "react";
import Footer from "./Footer";
import { publicFetchOptions, providersListUrl } from "@/lib/serverRevalidate";
import { fetchPublicBrandSettings } from "@/lib/fetchPublicBrandSettings";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const fetchFooterProviders = cache(async function fetchFooterProviders() {
  try {
    const res = await fetch(providersListUrl(API_BASE_URL), publicFetchOptions());
    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.filter((p) => p.is_active !== false).slice(0, 10);
  } catch {
    return [];
  }
});

export default async function FooterWrapper() {
  const [initialProviders, { logoUrl: initialLogoUrl }] = await Promise.all([
    fetchFooterProviders(),
    fetchPublicBrandSettings(),
  ]);
  return (
    <Footer initialProviders={initialProviders} initialLogoUrl={initialLogoUrl} />
  );
}
