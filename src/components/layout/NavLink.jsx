"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

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
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };
