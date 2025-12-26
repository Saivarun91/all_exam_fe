"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Search,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Star,
  Sparkles,
  BarChart3,
} from "lucide-react";

import { createSlug } from "@/lib/utils";

export default function SearchResults() {
  const router = useRouter();
  const params = useParams();

  // Extract provider & examCode from URL
  const slug = params.slug || [];
  const provider = slug[0] || "";
  const examCode = slug[1] || "";

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [minQuestions, setMinQuestions] = useState(0);

  // Mock database
  const allExams = [
    { id: 1, provider: "AWS", name: "AWS Solutions Architect Associate", code: "SAA-C03", category: "Cloud", practiceExams: 3, questions: 850, updated: "2 hours ago", trending: true, passRate: 94 },
    { id: 2, provider: "Microsoft", name: "Azure Administrator", code: "AZ-104", category: "Cloud", practiceExams: 2, questions: 720, updated: "5 hours ago", popular: true, passRate: 91 },
    { id: 3, provider: "CompTIA", name: "CompTIA Security+", code: "SY0-701", category: "Security", practiceExams: 4, questions: 980, updated: "8 hours ago", trending: true, passRate: 89 },
    { id: 4, provider: "Cisco", name: "CCNA 200-301", code: "CCNA", category: "Networking", practiceExams: 5, questions: 1200, updated: "12 hours ago", popular: true, passRate: 92 },
    { id: 5, provider: "Google", name: "Google Cloud Professional", code: "GCP-PCA", category: "Cloud", practiceExams: 2, questions: 650, updated: "1 day ago", isNew: true, passRate: 88 },
    { id: 6, provider: "PMI", name: "PMP Certification", code: "PMP", category: "Project Management", practiceExams: 3, questions: 890, updated: "1 day ago", passRate: 90 },
    { id: 7, provider: "AWS", name: "AWS Developer Associate", code: "DVA-C02", category: "Cloud", practiceExams: 2, questions: 780, updated: "2 days ago", passRate: 87 },
    { id: 8, provider: "Microsoft", name: "Azure Data Engineer", code: "DP-203", category: "Data", practiceExams: 2, questions: 560, updated: "2 days ago", passRate: 86 },
    { id: 9, provider: "Banking", name: "SBI PO Preliminary", code: "SBI-PO", category: "Banking", practiceExams: 6, questions: 1500, updated: "3 hours ago", trending: true, passRate: 85 },
    { id: 10, provider: "IIT-JEE", name: "JEE Main", code: "JEE-MAIN", category: "Engineering Entrance", practiceExams: 8, questions: 2400, updated: "1 day ago", popular: true, passRate: 78 },
    { id: 11, provider: "UPSC", name: "UPSC Civil Services Prelims", code: "UPSC-CSE", category: "Government", practiceExams: 10, questions: 3200, updated: "6 hours ago", trending: true, passRate: 72 },
    { id: 12, provider: "NEET", name: "NEET UG", code: "NEET-UG", category: "Medical Entrance", practiceExams: 7, questions: 2800, updated: "4 hours ago", popular: true, passRate: 75 },
  ];

  const providers = ["AWS", "Microsoft", "Google", "Cisco", "CompTIA", "PMI", "Banking", "IIT-JEE", "UPSC", "NEET"];
  const categories = ["Cloud", "Security", "Networking", "Data", "Project Management", "Banking", "Engineering Entrance", "Government", "Medical Entrance"];

  // Handle Search Navigation
  const handleSearch = () => {
    const providerSlug = selectedProvider !== "all" ? createSlug(selectedProvider) : "";
    const keywordSlug = searchKeyword.trim() ? createSlug(searchKeyword) : "";

    if (providerSlug && !keywordSlug) router.push(`/exams/${providerSlug}`);
    else if (!providerSlug && keywordSlug) router.push(`/exams/search/${keywordSlug}`);
    else if (providerSlug && keywordSlug) router.push(`/exams/${providerSlug}/${keywordSlug}`);
    else router.push(`/exams`);
  };

  const filteredExams = useMemo(() => {
    return allExams.filter((exam) => {
      if (provider && exam.provider.toLowerCase() !== provider) return false;
      if (examCode && exam.code.toLowerCase() !== examCode) return false;

      if (selectedProvider !== "all" && exam.provider !== selectedProvider) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(exam.category)) return false;

      if (searchKeyword) {
        const k = searchKeyword.toLowerCase();
        if (
          !exam.name.toLowerCase().includes(k) &&
          !exam.code.toLowerCase().includes(k) &&
          !exam.provider.toLowerCase().includes(k)
        )
          return false;
      }

      if (exam.questions < minQuestions) return false;

      return true;
    });
  }, [provider, examCode, selectedProvider, searchKeyword, selectedCategories, minQuestions]);

  const toggleCategory = (c) => {
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* SEARCH BAR */}
      <section className="pt-8 pb-6 px-4 bg-gradient-to-b from-[#0C1A35] via-[#0F3C71] to-[#0F3C71]">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">

            <div className="flex flex-col md:flex-row gap-3">
              {/* Provider Select */}
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-full md:w-[200px] bg-white/90 border-[#BFD4F5]">
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A73E8]" />
                <Input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Search by exam name, code, or keyword..."
                  className="pl-10 bg-white/90 border-[#BFD4F5]"
                />
              </div>

              <Button onClick={handleSearch} className="bg-[#1A73E8] text-white hover:bg-[#1557B0]">
                Search
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* Clean Wave Divider */}
      <div className="relative bg-[#0F3C71]">
        <svg className="w-full h-16" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#FFFFFF" />
        </svg>
      </div>

      {/* MAIN CONTENT */}
      <section className="pb-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* LEFT FILTERS */}
          <Card className="p-6 bg-white border-[#DDE7FF] space-y-6">
            <h3 className="text-lg font-semibold text-[#0C1A35]">Filters</h3>

            {/* Categories */}
            <div>
              <Label className="text-[#0C1A35] font-medium mb-3 block">Categories</Label>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedCategories.includes(cat)}
                      onCheckedChange={() => toggleCategory(cat)}
                    />
                    <span className="text-sm text-[#0C1A35]/70">{cat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions Count */}
            <div>
              <Label>Minimum Questions</Label>
              <Input
                type="number"
                value={minQuestions}
                onChange={(e) => setMinQuestions(Number(e.target.value))}
                className="bg-white border-[#DDE7FF]"
              />
            </div>
          </Card>

          {/* RESULTS */}
          <div className="lg:col-span-3 space-y-6">

            {/* Trust Bar */}
            <Card className="p-4 border-[#DDE7FF]">
              <div className="grid grid-cols-2 md:grid-cols-4 text-center gap-4">
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="text-[#1A73E8]" />
                  <span className="font-semibold">94% Match</span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="text-[#1A73E8]" />
                  <span className="font-semibold">Daily Updates</span>
                </div>
                <div className="flex flex-col items-center">
                  <Users className="text-[#1A73E8]" />
                  <span className="font-semibold">Trusted by 1000s</span>
                </div>
                <div className="flex flex-col items-center">
                  <BarChart3 className="text-[#1A73E8]" />
                  <span className="font-semibold">Real Exam Style</span>
                </div>
              </div>
            </Card>

            {/* EXAM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredExams.map((exam) => (
                <Card key={exam.id} className="p-6 border-[#DDE7FF] shadow hover:-translate-y-1 transition">

                  <Badge>{exam.provider}</Badge>
                  <Badge className="ml-2">{exam.category}</Badge>

                  <h3 className="text-xl font-semibold mt-2">{exam.name}</h3>
                  <p className="text-sm text-gray-600">{exam.code}</p>

                  <div className="flex gap-2 mt-3 flex-wrap">
                    {exam.trending && (
                      <Badge className="bg-orange-500/10 text-orange-600"><TrendingUp size={12}/> Trending</Badge>
                    )}
                    {exam.popular && (
                      <Badge className="bg-yellow-500/10 text-yellow-600"><Star size={12}/> Popular</Badge>
                    )}
                    {exam.isNew && (
                      <Badge className="bg-green-500/10 text-green-600"><Sparkles size={12}/> New</Badge>
                    )}
                    <Badge className="bg-blue-500/10 text-blue-600">
                      <BarChart3 size={12}/> {exam.passRate}% Pass Rate
                    </Badge>
                  </div>

                  <p className="mt-3">{exam.practiceExams} Practice Exams · {exam.questions} Questions</p>
                  <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] mt-2">Updated {exam.updated}</Badge>

                  <Button
                    className="w-full mt-4 bg-[#1A73E8] hover:bg-[#1557B0]"
                    onClick={() => router.push(`/exams/${createSlug(exam.provider)}/${createSlug(exam.code)}`)}
                  >
                    Start Practicing →
                  </Button>
                </Card>
              ))}
            </div>

            {filteredExams.length === 0 && (
              <Card className="p-10 text-center border-[#DDE7FF]">
                <h3 className="text-xl font-semibold">No exams found</h3>
                <Button className="mt-4" onClick={() => window.location.reload()}>
                  Reset Filters
                </Button>
              </Card>
            )}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
