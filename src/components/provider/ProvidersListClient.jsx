"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProviderCardExams from "@/components/provider/ProviderCardExams";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import OptimizedImage from "@/components/common/OptimizedImage";
import { t } from "@/lib/uiStrings";

const PROVIDER_LOGO_HEIGHT = 72;
const PROVIDER_LOGO_MAX_WIDTH = 220;

function providerMatchesSearch(provider, query) {
  const name = String(provider?.name || "").toLowerCase();
  const slug = String(provider?.slug || "").toLowerCase();
  const description = String(provider?.description || "").toLowerCase();

  if (name.includes(query) || slug.includes(query) || description.includes(query)) {
    return true;
  }

  return (provider?.exams || []).some((exam) => {
    const title = String(exam?.title || exam?.name || "").toLowerCase();
    const code = String(exam?.code || "").toLowerCase();
    return title.includes(query) || code.includes(query);
  });
}

export default function ProvidersListClient({ providers = [] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProviders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return providers;
    return providers.filter((provider) => providerMatchesSearch(provider, query));
  }, [providers, searchTerm]);

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

      {filteredProviders.length === 0 ? (
        <p className="py-12 text-center text-[#0C1A35]/60">
          {searchTerm.trim()
            ? `${t("common.no_providers")} "${searchTerm.trim()}".`
            : t("common.no_providers")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {filteredProviders.map((provider) => {
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
    </>
  );
}
