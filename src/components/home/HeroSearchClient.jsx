"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createSlug } from "@/lib/utils";

export default function HeroSearchClient({ providers }) {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearch = () => {
    let targetUrl = "/exams";

    if (selectedProvider && searchKeyword.trim()) {
      const keywordSlug = createSlug(searchKeyword.trim());
      targetUrl = `/${selectedProvider}/search/${encodeURIComponent(
        keywordSlug
      )}`;
    } else if (selectedProvider) {
      targetUrl = `/${selectedProvider}`;
    } else if (searchKeyword.trim()) {
      const keywordSlug = createSlug(searchKeyword.trim());
      targetUrl = `/exams/search/${encodeURIComponent(keywordSlug)}`;
    }

    router.push(targetUrl);
  };

  return (
    <div
      className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 md:p-4 max-w-3xl mx-auto"
      role="search"
      aria-label="Search certification exams"
    >
      <div className="flex flex-col md:flex-row gap-3 items-center">

        <div className="relative w-full md:w-[200px] shrink-0">
          <select
            id="hero-search-provider"
            aria-label="Exam provider (optional)"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-full appearance-none bg-white/95 h-11 min-h-[44px] rounded-md border border-input px-3 pr-9 text-sm text-[#0C1A35] shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" data-i18n="home.search.provider">
              Select Provider
            </option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.slug}>
                {provider.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 opacity-50 text-[#0C1A35]"
            aria-hidden
          />
        </div>

        <Input
          id="hero-search-query"
          data-i18n-placeholder="home.search.placeholder"
          aria-label="Search by exam name, code, or keyword"
          className="flex-1 bg-white/95 h-11 min-h-[44px] text-sm text-[#0C1A35]"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <Button
          type="button"
          onClick={handleSearch}
          className="bg-[#1A73E8] text-white hover:bg-[#1557B0] px-6 h-11 min-h-[44px] min-w-[44px] text-sm"
        >
          <Search className="w-4 h-4 mr-2" />
          <span data-i18n="home.search.button">Search</span>
        </Button>

      </div>
    </div>
  );
}
