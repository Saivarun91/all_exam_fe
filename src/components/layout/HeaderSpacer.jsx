"use client";

import { usePathname } from "next/navigation";

export default function HeaderSpacer() {
  const pathname = usePathname();
  
  // Don't show spacer on admin routes (header won't be shown)
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  
  return <div className="h-16 md:h-20"></div>;
}

