"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      targetUrl = `/exams/${selectedProvider}/search/${encodeURIComponent(
        keywordSlug
      )}`;
    } else if (selectedProvider) {
      targetUrl = `/exams/${selectedProvider}`;
    } else if (searchKeyword.trim()) {
      const keywordSlug = createSlug(searchKeyword.trim());
      targetUrl = `/exams/search/${encodeURIComponent(keywordSlug)}`;
    }

    router.push(targetUrl);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 md:p-4 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row gap-3 items-center">

        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
          <SelectTrigger className="w-full md:w-[200px] bg-white/95 h-11 text-sm text-[#0C1A35]">
            <SelectValue placeholder="Select Provider" />
          </SelectTrigger>

          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider.id} value={provider.slug}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Search exams, codes, or keywords..."
          className="flex-1 bg-white/95 h-11 text-sm text-[#0C1A35]"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <Button
          onClick={handleSearch}
          className="bg-[#1A73E8] text-white hover:bg-[#1557B0] px-6 h-11 text-sm"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>

      </div>
    </div>
  );
}