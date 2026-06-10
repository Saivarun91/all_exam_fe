import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function PracticePageBreadcrumbs({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <Breadcrumb>
        <BreadcrumbList className="flex flex-wrap items-center gap-y-1 text-sm">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;

            return (
              <BreadcrumbItem
                key={`${item.name}-${idx}`}
                className="inline-flex items-center"
              >
                {isLast ? (
                  <BreadcrumbPage className="font-medium text-[#0C1A35]">
                    {item.name}
                  </BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink asChild>
                      <Link
                        href={item.url}
                        className="text-[#0C1A35]/65 hover:text-[#1A73E8] transition-colors"
                      >
                        {item.name}
                      </Link>
                    </BreadcrumbLink>

                    <BreadcrumbSeparator className="text-[#0C1A35]/30" />
                  </>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
}

export const PRACTICE_PAGE_CONTAINER =
  "container mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8";