"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function BodyWrapper({ children }) {
  const pathname = usePathname();
  const [isHeaderLoaded, setIsHeaderLoaded] = useState(false);
  const intervalRef = useRef(null);

  // Check if we're on an admin route - header won't be shown, so don't wait for it
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    // If on admin route, immediately allow rendering (header won't appear)
    if (isAdminRoute) {
      setIsHeaderLoaded(true);
      return;
    }

    // Check if header is already loaded (for cases where event was dispatched before this component mounted)
    const checkHeaderLoaded = () => {
      // If header exists in DOM and has height, it's loaded
      const header = document.querySelector("header");
      if (header && header.offsetHeight > 0) {
        setIsHeaderLoaded(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkHeaderLoaded()) {
      return;
    }

    // Listen for header loaded event
    const handleHeaderLoaded = () => {
      setIsHeaderLoaded(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    window.addEventListener("headerLoaded", handleHeaderLoaded);

    // Fallback: check periodically in case event was missed
    intervalRef.current = setInterval(() => {
      if (checkHeaderLoaded()) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 100);

    // Cleanup
    return () => {
      window.removeEventListener("headerLoaded", handleHeaderLoaded);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAdminRoute]);

  // Don't render children until header is loaded (or if on admin route)
  if (!isHeaderLoaded) {
    return null;
  }

  return <>{children}</>;
}

