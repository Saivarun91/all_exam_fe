"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import ListPagination from "@/components/common/ListPagination";
import ProviderCardExams from "@/components/provider/ProviderCardExams";
import OptimizedImage from "@/components/common/OptimizedImage";
import { t } from "@/lib/uiStrings";

const PROVIDER_LOGO_HEIGHT = 72;
const PROVIDER_LOGO_MAX_WIDTH = 220;

export default function ProvidersListClient({
  providers = [],
  initialSearchTerm = "",
  pagination = null,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const pageSize = Number(pagination?.page_size) || 24;
  const totalItems = Number(pagination?.count) || providers.length;
  const totalPages =
    Number(pagination?.total_pages) ||
    Math.max(1, Math.ceil(totalItems / pageSize) || 1);
  const currentPage = Math.min(
    Math.max(1, Number(pagination?.page) || 1),
    totalPages
  );

  const updateURL = (nextParams) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    Object.entries(nextParams).forEach(([key, value]) => {
      const normalized = String(value ?? "").trim();
      if (normalized) {
        params.set(key, normalized);
      } else {
        params.delete(key);
      }
    });
    const query = params.toString();
    router.push(`${pathname || "/providers"}${query ? `?${query}` : ""}`, {
      scroll: false,
    });
  };

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    console.log("[ProvidersListClient] frontend data received:", {
      pagination: {
        page: currentPage,
        totalPages,
        totalItems,
        pageSize,
      },
      renderedItems: providers.length,
      searchTerm: initialSearchTerm,
      sample: providers.slice(0, 3).map((provider) => ({
        id: provider.id,
        name: provider.name,
        slug: provider.slug,
        examCount: provider.examCount,
        previewCount: Array.isArray(provider.exams) ? provider.exams.length : 0,
      })),
    });
  }, [
    currentPage,
    initialSearchTerm,
    pageSize,
    providers,
    totalItems,
    totalPages,
  ]);

  useEffect(() => {
    const normalized = searchTerm.trim();
    if (normalized === initialSearchTerm) return;

    const handle = setTimeout(() => {
      updateURL({ q: normalized, page: "1" });
    }, 350);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, initialSearchTerm]);

  return (
    <>
      <div className="mb-8">
        <div className="relative mx-auto max-w-lg">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0C1A35]/50"
            aria-hidden
          />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("common.search_providers")}
            aria-label={t("common.search_providers")}
            className="border-[#DDE7FF] pl-10 focus-visible:ring-[#1A73E8]"
          />
        </div>
      </div>

      {providers.length === 0 ? (
        <p className="py-12 text-center text-[#0C1A35]/60">
          {searchTerm.trim()
            ? `${t("common.no_providers")} "${searchTerm.trim()}".`
            : t("common.no_providers")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {providers.map((provider) => {
            const providerLogo =
              provider?.logo_url || provider?.logoUrl || provider?.logo || "";

            return (
              <div
                key={provider.id}
                className="flex h-full flex-col rounded-lg border border-[#DDE7FF] bg-white p-5 shadow-sm hover:shadow-md"
              >
                {providerLogo ? (
                  <Link
                    href={`/providers/${provider.slug}`}
                    className="mb-4 flex w-full shrink-0 items-center justify-center"
                    style={{
                      height: PROVIDER_LOGO_HEIGHT,
                      minHeight: PROVIDER_LOGO_HEIGHT,
                    }}
                    aria-label={`View exams by ${provider.name}`}
                  >
                    <OptimizedImage
                      src={providerLogo}
                      alt={provider.name}
                      width={PROVIDER_LOGO_MAX_WIDTH}
                      height={PROVIDER_LOGO_HEIGHT}
                      className="block object-contain object-center"
                      style={{
                        height: PROVIDER_LOGO_HEIGHT,
                        minHeight: PROVIDER_LOGO_HEIGHT,
                        maxHeight: PROVIDER_LOGO_HEIGHT,
                        maxWidth: PROVIDER_LOGO_MAX_WIDTH,
                      }}
                      sizes={`${PROVIDER_LOGO_MAX_WIDTH}px`}
                      crop="fit"
                    />
                  </Link>
                ) : null}

                <div className="flex items-start justify-between gap-3 border-b border-[#E8EEF5] pb-3">
                  <h2 className="min-w-0 flex-1 text-base font-semibold">
                    <Link
                      href={`/providers/${provider.slug}`}
                      className="font-semibold leading-snug text-[#1A73E8] hover:underline"
                    >
                      {provider.name}
                    </Link>
                  </h2>
                  <p className="shrink-0 whitespace-nowrap text-sm text-[#0C1A35]/70">
                    {provider.examCount} Exam{provider.examCount === 1 ? "" : "s"}
                  </p>
                </div>

                <ProviderCardExams exams={provider.exams || []} />
              </div>
            );
          })}
        </div>
      )}

      <ListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        itemLabel="providers"
        onPageChange={(page) => updateURL({ page })}
      />
    </>
  );
}
