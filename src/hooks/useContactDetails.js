"use client";

import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// Cache for contact details
let cachedContactDetails = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useContactDetails() {
  const [contactDetails, setContactDetails] = useState({
    email: '',
    phone: '',
    address: '',
    website: '',
  });

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        // Use public endpoint for contact details (no auth required)
        const res = await fetch(`${API_BASE_URL}/api/settings/public/`);

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const details = {
              email: data.contact_email || '',
              phone: data.contact_phone || '',
              address: data.contact_address || '',
              website: data.contact_website || '',
            };
            cachedContactDetails = details;
            cacheTimestamp = Date.now();
            setContactDetails(details);
          }
        }
      } catch (err) {
        console.error("Error fetching contact details:", err);
      }
    };

    // Check cache first
    const now = Date.now();
    if (cachedContactDetails && (now - cacheTimestamp) < CACHE_DURATION) {
      setContactDetails(cachedContactDetails);
    } else {
      fetchContactDetails();
    }

    // Listen for contact details updates
    const handleContactDetailsUpdate = () => {
      cachedContactDetails = null;
      cacheTimestamp = 0;
      fetchContactDetails();
    };

    window.addEventListener('siteNameUpdated', handleContactDetailsUpdate);
    window.addEventListener('contactDetailsUpdated', handleContactDetailsUpdate);

    return () => {
      window.removeEventListener('siteNameUpdated', handleContactDetailsUpdate);
      window.removeEventListener('contactDetailsUpdated', handleContactDetailsUpdate);
    };
  }, []);

  return contactDetails;
}

