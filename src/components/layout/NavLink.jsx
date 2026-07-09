"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { NEW_TAB_LINK_PROPS } from "@/lib/appNavigation";
import { usePathname } from "@/lib/navigation/client";

const NavLink = forwardRef(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    const pathname = usePathname();

    const isActive = pathname === to;
    const isPending = false; // Next.js has no pending state like react-router

    return (
      <Link
        ref={ref}
        href={to}
        className={cn(
          className,
          isActive && activeClassName,
          isPending && pendingClassName
        )}
        {...NEW_TAB_LINK_PROPS}
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };
