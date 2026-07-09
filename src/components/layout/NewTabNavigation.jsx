"use client";

import { useEffect } from "react";

import {
  isNavigableHref,
  openInNewTab,
  shouldKeepSameTab,
} from "@/lib/appNavigation";

export default function NewTabNavigation() {
  useEffect(() => {
    const onClick = (event) => {
      const anchor = event.target.closest("a[href]");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!isNavigableHref(href)) return;
      if (shouldKeepSameTab({ href, element: anchor })) return;

      event.preventDefault();
      event.stopPropagation();

      const destination =
        anchor.href || anchor.getAttribute("href") || href;
      openInNewTab(destination);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
