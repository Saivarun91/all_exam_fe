"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getExamUrl } from "@/lib/utils";
import ItemListJsonLd from "@/components/ItemListJsonLd";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const RecentlyUpdated = () => {
  const [exams, setExams] = useState([]);
  const [sectionSettings, setSectionSettings] = useState({
    heading: "Recently Updated Exams",
    subtitle: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch section settings
    fetch(`${API_BASE_URL}/api/home/recently-updated-section/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSectionSettings(data.data);
        }
      })
      .catch((err) => console.error("Error fetching section settings:", err));
    
    fetch(`${API_BASE_URL}/api/home/recently-updated-exams/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          // Only show active exams
          const activeExams = data.data.filter(exam => exam.is_active);
          setExams(activeExams);
        }
      })
      .catch((err) => console.error("Error fetching recently updated exams:", err))
      .finally(() => setLoading(false));
  }, []);
  

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-gradient-to-b from-[#0C1A35]/2 to-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#0C1A35]/70 text-sm md:text-base">Loading recently updated exams...</p>
        </div>
      </section>
    );
  }

  if (!exams.length) {
    return null; // Hide section if no exams
  }

  // Prepare items for schema
  const schemaItems = exams.map((exam) => ({
    title: exam.title,
    description: exam.description || exam.excerpt || "",
    provider: exam.provider || "",
    url: getExamUrl(exam),
  }));

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-[#0C1A35]/2 to-white">
      {exams.length > 0 && (
        <ItemListJsonLd
          items={schemaItems}
          listName={sectionSettings.heading || "Recently Updated Exams"}
          itemType="Course"
          schemaId="recently-updated-json-ld-schema"
        />
      )}
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4 text-[#0C1A35] px-2">
          {sectionSettings.heading || "Recently Updated Exams"}
        </h2>
        {sectionSettings.subtitle && (
          <p className="text-center text-[#0C1A35]/70 text-sm sm:text-base md:text-lg mb-8 md:mb-12 max-w-2xl mx-auto px-2">
            {sectionSettings.subtitle}
          </p>
        )}

        <div className="max-w-5xl mx-auto">
          <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {exams.map((exam, index) => (
            <div
              key={exam.id || index}
              className="bg-white border border-[#DDE7FF] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-[0_6px_20px_rgba(26,115,232,0.15)] hover:-translate-y-1 transition-all shadow-[0_2px_8px_rgba(26,115,232,0.08)]"
            >
              {/* Left side: Icon + Exam Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-lg bg-[#1A73E8]/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-[#1A73E8]" />
                </div>

                <div className="flex-1">
                  {/* Exam Name + Code */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-[#0C1A35] text-lg">{exam.title}</h3>
                    <Badge
                      variant="outline"
                      className="text-xs border-[#D3E3FF] text-[#0C1A35] font-medium"
                    >
                      {exam.code}
                    </Badge>
                  </div>
                  
                  {/* Provider */}
                  <p className="text-sm text-[#0C1A35]/60 mb-2">{exam.provider}</p>
                  
                  {/* Update Badge + Stats */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {exam.badge && (
                      <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] text-xs">
                        {exam.badge}
                      </Badge>
                    )}
                    <p className="text-sm text-[#0C1A35]/60">
                      {(() => {
                        // Use actual count from practice_tests_list if available
                        if (exam.practice_tests_list && Array.isArray(exam.practice_tests_list) && exam.practice_tests_list.length > 0) {
                          return exam.practice_tests_list.length;
                        }
                        return exam.practice_exams || 0;
                      })()} Practice Exams · {(() => {
                        // Calculate total questions from practice tests list if available
                        if (exam.practice_tests_list && Array.isArray(exam.practice_tests_list) && exam.practice_tests_list.length > 0) {
                          const totalQuestions = exam.practice_tests_list.reduce((sum, test) => {
                            const testQuestions = parseInt(test.questions) || 0;
                            return sum + testQuestions;
                          }, 0);
                          return totalQuestions > 0 ? totalQuestions : (exam.questions || 0);
                        }
                        return exam.questions || 0;
                      })()} Questions
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side: Practice Now Button */}
              {exam.slug && (
                <Button
                  size="default"
                  className="bg-[#1A73E8] text-white hover:bg-[#1557B0] whitespace-nowrap"
                  asChild
                >
                  <Link href={`/exam-details/${exam.slug}`}>
                    Practice Now
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentlyUpdated;
