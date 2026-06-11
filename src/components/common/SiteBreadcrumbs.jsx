import Link from "next/link";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const VARIANT_STYLES = {
  default: {
    link: "text-[#0C1A35]/60 hover:text-[#1A73E8]",
    page: "text-[#0C1A35] font-medium",
    separator: "",
  },
  dark: {
    link: "text-slate-400 hover:text-cyan-300 transition-colors",
    page: "text-cyan-200 font-medium truncate max-w-[200px] sm:max-w-none",
    separator: "text-slate-500",
  },
};

export function toBreadcrumbJsonLdItems(items = []) {
  return items.map((item) => ({
    name: item.label || item.name || "",
    url: item.href || item.url || "",
  }));
}

export function SiteBreadcrumbBar({ children, className }) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className={cn("container mx-auto px-4 py-3", className)}>
        {children}
      </div>
    </div>
  );
}

export default function SiteBreadcrumbs({
  items = [],
  variant = "default",
  className,
}) {
  if (!items.length) return null;

  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.default;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const label = item.label || item.name || "";
          const href = item.href ?? item.url;
          const isLast = index === items.length - 1;

          return (
            <Fragment key={`${label}-${index}`}>
              {index > 0 ? (
                <BreadcrumbSeparator className={styles.separator} />
              ) : null}
              <BreadcrumbItem>
                {isLast || !href ? (
                  <BreadcrumbPage className={styles.page}>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href} className={styles.link}>
                      {label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
