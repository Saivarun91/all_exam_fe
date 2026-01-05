"use client";

import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// Cache for social media URLs
let cachedSocialUrls = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useSocialMediaUrls() {
  const [socialUrls, setSocialUrls] = useState({
    facebook: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    instagram: '',
  });

  useEffect(() => {
    const fetchSocialUrls = async () => {
      try {
        // Use public endpoint for social media URLs (no auth required)
        const res = await fetch(`${API_BASE_URL}/api/settings/public/`);

        if (res.ok) {
          const data = await res.json();
          console.log("Social Media URLs:", data);
          if (data.success) {
            const urls = {
              facebook: data.social_facebook_url || '',
              twitter: data.social_twitter_url || '',
              linkedin: data.social_linkedin_url || '',
              youtube: data.social_youtube_url || '',
              instagram: data.social_instagram_url || '',
            };
            cachedSocialUrls = urls;
            cacheTimestamp = Date.now();
            setSocialUrls(urls);
          }
        }
      } catch (err) {
        console.error("Error fetching social media URLs:", err);
      }
    };

    // Check cache first
    const now = Date.now();
    if (cachedSocialUrls && (now - cacheTimestamp) < CACHE_DURATION) {
      setSocialUrls(cachedSocialUrls);
    } else {
      fetchSocialUrls();
    }

    // Listen for social media URLs updates
    const handleSocialUrlsUpdate = () => {
      cachedSocialUrls = null;
      cacheTimestamp = 0;
      fetchSocialUrls();
    };

    window.addEventListener('socialMediaUrlsUpdated', handleSocialUrlsUpdate);
    window.addEventListener('siteNameUpdated', handleSocialUrlsUpdate);

    return () => {
      window.removeEventListener('socialMediaUrlsUpdated', handleSocialUrlsUpdate);
      window.removeEventListener('siteNameUpdated', handleSocialUrlsUpdate);
    };
  }, []);

  return socialUrls;
}

