"use client";

import { useState, useEffect } from "react";
import { fetchPublicSettings, clearPublicSettingsCache } from "@/lib/fetchPublicSettings";

export function useSocialMediaUrls() {
  const [socialUrls, setSocialUrls] = useState({
    facebook: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    instagram: "",
  });

  useEffect(() => {
    let cancelled = false;

    const loadSocialUrls = async () => {
      const data = await fetchPublicSettings();
      if (cancelled || !data) return;

      setSocialUrls({
        facebook: data?.social_facebook_url || "",
        twitter: data?.social_twitter_url || "",
        linkedin: data?.social_linkedin_url || "",
        youtube: data?.social_youtube_url || "",
        instagram: data?.social_instagram_url || "",
      });
    };

    loadSocialUrls();

    const handleUpdate = () => {
      clearPublicSettingsCache();
      loadSocialUrls();
    };

    window.addEventListener("socialMediaUpdated", handleUpdate);
    window.addEventListener("socialMediaUrlsUpdated", handleUpdate);
    window.addEventListener("siteNameUpdated", handleUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener("socialMediaUpdated", handleUpdate);
      window.removeEventListener("socialMediaUrlsUpdated", handleUpdate);
      window.removeEventListener("siteNameUpdated", handleUpdate);
    };
  }, []);

  return socialUrls;
}
