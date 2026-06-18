"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createSlug, cn } from "@/lib/utils";

const EXAM_SEARCH_PLACEHOLDER = "Search exam name, code, or keyword...";

function getProviderSlug(provider) {
  return (provider?.slug || createSlug(provider?.name || "")).trim();
}

export default function HeroSearchClient({ providers }) {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [providerSearch, setProviderSearch] = useState("");

  const selectedProviderName =
    providers.find((provider) => getProviderSlug(provider) === selectedProvider)
      ?.name || "";

  const filteredProviders = providers.filter((provider) => {
    const query = providerSearch.trim().toLowerCase();
    if (!query) return true;
    const slug = getProviderSlug(provider).toLowerCase();
    return (
      provider.name?.toLowerCase().includes(query) || slug.includes(query)
    );
  });

  const handleProviderDropdownChange = (open) => {
    setProviderDropdownOpen(open);
    if (!open) {
      setProviderSearch("");
    }
  };

  const handleSearch = () => {
    let targetUrl = "/exams";

    if (selectedProvider && searchKeyword.trim()) {
      const keywordSlug = createSlug(searchKeyword.trim());
      targetUrl = `/exams/${selectedProvider}/search/${encodeURIComponent(
        keywordSlug
      )}`;
    } else if (selectedProvider) {
      targetUrl = `/providers/${selectedProvider}`;
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

        <div className="relative w-full md:w-[240px] shrink-0">
          <Popover
            open={providerDropdownOpen}
            onOpenChange={handleProviderDropdownChange}
          >
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={providerDropdownOpen}
                aria-label="Exam provider (optional)"
                id="hero-search-provider"
                className="w-full justify-between bg-white/95 h-11 min-h-[44px] rounded-md border border-input px-3 text-sm font-normal text-[#0C1A35] shadow-xs hover:bg-white/95"
              >
                <span className="truncate">
                  {selectedProviderName || (
                    <span data-i18n="home.search.provider">Select Provider</span>
                  )}
                </span>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] min-w-[260px] max-w-[min(100vw-2rem,360px)] p-0 z-[100]"
              align="start"
              sideOffset={6}
            >
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search provider..."
                  value={providerSearch}
                  onValueChange={setProviderSearch}
                />
                <CommandList className="max-h-[260px]">
                  {providerSearch.trim() && filteredProviders.length === 0 ? (
                    <CommandEmpty>No provider found.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {!providerSearch.trim() && (
                        <CommandItem
                          value="select-provider"
                          className="min-h-[40px] cursor-pointer"
                          onSelect={() => {
                            setSelectedProvider("");
                            setProviderDropdownOpen(false);
                            setProviderSearch("");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 size-4",
                              !selectedProvider ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span data-i18n="home.search.provider">Select Provider</span>
                        </CommandItem>
                      )}
                      {filteredProviders.map((provider) => {
                        const providerSlug = getProviderSlug(provider);
                        return (
                        <CommandItem
                          key={provider.id || providerSlug}
                          value={providerSlug}
                          className="min-h-[40px] cursor-pointer"
                          onSelect={() => {
                            setSelectedProvider(providerSlug);
                            setProviderDropdownOpen(false);
                            setProviderSearch("");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 size-4",
                              selectedProvider === providerSlug
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <span className="truncate">{provider.name}</span>
                        </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <Input
          id="hero-search-query"
          placeholder={EXAM_SEARCH_PLACEHOLDER}
          data-i18n-placeholder="home.search.placeholder"
          data-i18n-fallback={EXAM_SEARCH_PLACEHOLDER}
          aria-label="Search by exam name, code, or keyword"
          className="flex-1 bg-white/95 h-11 min-h-[44px] text-sm text-[#0C1A35] placeholder:text-[#0C1A35]/60"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          suppressHydrationWarning
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
