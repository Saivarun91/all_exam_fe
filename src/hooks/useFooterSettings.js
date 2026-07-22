"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_FOOTER_SETTINGS,
  normalizeFooterSettings,
} from "@/lib/footerDefaults";
import {
  clearFooterSettingsCache,
  fetchFooterSettings,
} from "@/lib/fetchFooterSettings";

export function useFooterSettings(initialSettings = null) {
  const [settings, setSettings] = useState(() =>
    normalizeFooterSettings(initialSettings || DEFAULT_FOOTER_SETTINGS)
  );

  useEffect(() => {
    let cancelled = false;

    const load = async (force = false) => {
      const data = await fetchFooterSettings({ force });
      if (!cancelled && data) {
        setSettings(normalizeFooterSettings(data));
      }
    };

    // Keep SSR values instantly; refresh from API in background.
    load(Boolean(!initialSettings));

    const handleUpdate = () => {
      clearFooterSettingsCache();
      load(true);
    };

    window.addEventListener("footerSettingsUpdated", handleUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("footerSettingsUpdated", handleUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return settings;
}
