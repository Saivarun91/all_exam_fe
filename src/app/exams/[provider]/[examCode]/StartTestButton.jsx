"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation/client";
import { Button } from "@/components/ui/button";

const SCROLL_TO_PRACTICE_TESTS_KEY = "scrollToPracticeTests";

export default function StartTestButton({
  url,
  label = "Start Practicing →",
  className = "w-full bg-[#1A73E8] text-white hover:bg-[#1557B0] h-12 text-lg",
  openInNewTab = true,
  scrollToPracticeTests = false,
}) {
  const router = useRouter();
  const href = typeof url === "string" ? url.trim() : "";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!href) {
    return (
      <Button type="button" className={className} disabled>
        {label}
      </Button>
    );
  }

  const goToPractice = (targetUrl = href) => {
    if (typeof window === "undefined") return;

    const cleanUrl = String(targetUrl || "")
      .trim()
      .replace(/#.*$/, "");

    if (scrollToPracticeTests) {
      try {
        sessionStorage.setItem(SCROLL_TO_PRACTICE_TESTS_KEY, "1");
      } catch {
        // ignore storage failures
      }
    }

    if (openInNewTab) {
      window.open(cleanUrl, "_blank", "noopener,noreferrer");
      return;
    }

    router.push(cleanUrl);
  };

  const handleClick = () => {
    if (!mounted) return;
    goToPractice(href);
  };

  return (
    <Button type="button" className={className} onClick={handleClick}>
      {label}
    </Button>
  );
}
