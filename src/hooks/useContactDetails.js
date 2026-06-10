"use client";

import { useState, useEffect } from "react";
import { fetchPublicSettings, clearPublicSettingsCache } from "@/lib/fetchPublicSettings";

export function useContactDetails() {
  const [contactDetails, setContactDetails] = useState({
    email: "",
    phone: "",
    address: "",
    website: "",
  });

  useEffect(() => {
    let cancelled = false;

    const loadContactDetails = async () => {
      const data = await fetchPublicSettings();
      if (cancelled || !data) return;

      setContactDetails({
        email: data?.contact_email || "",
        phone: data?.contact_phone || "",
        address: data?.contact_address || "",
        website: data?.contact_website || "",
      });
    };

    loadContactDetails();

    const handleUpdate = () => {
      clearPublicSettingsCache();
      loadContactDetails();
    };

    window.addEventListener("contactDetailsUpdated", handleUpdate);
    window.addEventListener("siteNameUpdated", handleUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener("contactDetailsUpdated", handleUpdate);
      window.removeEventListener("siteNameUpdated", handleUpdate);
    };
  }, []);

  return contactDetails;
}
