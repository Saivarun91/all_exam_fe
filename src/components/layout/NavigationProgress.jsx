"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const onClick = (event) => {
      const anchor = event.target.closest("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("http")
      ) {
        return;
      }

      const nextPath = href.split("?")[0].split("#")[0] || "/";
      const currentPath = window.location.pathname;
      if (nextPath === currentPath) return;

      setActive(true);
      setProgress(18);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!active) return undefined;

    intervalRef.current = window.setInterval(() => {
      setProgress((value) => (value >= 88 ? value : value + 6));
    }, 120);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;

    setProgress(100);
    const hideTimer = window.setTimeout(() => {
      setActive(false);
      setProgress(0);
    }, 220);

    return () => window.clearTimeout(hideTimer);
  }, [pathname, active]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5"
      aria-hidden
    >
      <div
        className="h-full bg-[#1A73E8] shadow-[0_0_8px_rgba(26,115,232,0.45)] transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
