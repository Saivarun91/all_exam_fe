"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function BodyWrapper({ children }) {
  const pathname = usePathname();
  const [isHeaderLoaded, setIsHeaderLoaded] = useState(false);

  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) {
      setIsHeaderLoaded(true);
      return undefined;
    }

    const show = () => setIsHeaderLoaded(true);

    const onHeaderLoaded = () => {
      window.removeEventListener("headerLoaded", onHeaderLoaded);
      show();
    };

    window.addEventListener("headerLoaded", onHeaderLoaded);

    // If the header node is already mounted (event may have fired early), show next frame without polling layout.
    const raf = requestAnimationFrame(() => {
      if (document.querySelector("header")) {
        window.removeEventListener("headerLoaded", onHeaderLoaded);
        show();
      }
    });

    const fallback = window.setTimeout(() => {
      window.removeEventListener("headerLoaded", onHeaderLoaded);
      show();
    }, 2500);

    return () => {
      window.removeEventListener("headerLoaded", onHeaderLoaded);
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
    };
  }, [isAdminRoute]);

  if (!isHeaderLoaded) {
    return null;
  }

  return <>{children}</>;
}
