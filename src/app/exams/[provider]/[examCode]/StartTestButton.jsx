"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StartTestButton({
  url,
  label = "Start Practicing →",
  className = "w-full bg-[#1A73E8] text-white hover:bg-[#1557B0] h-12 text-lg",
  openInNewTab = true,
}) {
  const href = typeof url === "string" ? url.trim() : "";

  if (!href) {
    return (
      <Button type="button" className={className} disabled>
        {label}
      </Button>
    );
  }

  return (
    <Button asChild type="button" className={className}>
      <Link
        href={href}
        prefetch
        {...(openInNewTab
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {label}
      </Link>
    </Button>
  );
}
