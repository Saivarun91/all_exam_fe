"use client";

import { useMemo } from "react";
import {
  useRouter as useNextRouter,
  usePathname,
  useSearchParams,
  useParams,
} from "next/navigation";

import { openInNewTab, shouldKeepSameTab } from "@/lib/appNavigation";

export function useRouter() {
  const router = useNextRouter();

  return useMemo(() => {
    const push = (href, options) => {
      if (shouldKeepSameTab({ href, options })) {
        return router.push(href, options);
      }
      openInNewTab(href);
    };

    return {
      ...router,
      push,
    };
  }, [router]);
}

export { usePathname, useSearchParams, useParams };
