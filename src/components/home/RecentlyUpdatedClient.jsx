"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getExamUrl } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import Trans from "@/components/i18n/Trans";
import { REACT_I18N_ATTR } from "@/lib/domI18nUtils";

export default function RecentlyUpdatedClient({ sectionSettings, exams }) {
  const { lt } = useLanguage();

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-[#0C1A35]/2 to-white">
      <div className="container mx-auto px-4">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4 text-[#0C1A35] px-2"
          {...{ [REACT_I18N_ATTR]: "" }}
        >
          {lt(
            "cms.recent.heading",
            sectionSettings.heading || "Recently Updated Exams"
          )}
        </h2>

        {sectionSettings.subtitle && (
          <p
            className="text-center text-[#0C1A35]/70 text-sm sm:text-base md:text-lg mb-8 md:mb-12 max-w-2xl mx-auto px-2"
            {...{ [REACT_I18N_ATTR]: "" }}
          >
            {lt("cms.recent.subtitle", sectionSettings.subtitle)}
          </p>
        )}

        <div className="max-w-5xl mx-auto">
          <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {exams.map((exam, index) => {
              let practiceCount = 0;
              if (
                exam.practice_tests_list &&
                Array.isArray(exam.practice_tests_list) &&
                exam.practice_tests_list.length > 0
              ) {
                practiceCount = exam.practice_tests_list.length;
              } else {
                practiceCount = exam.practice_exams || 0;
              }

              let totalQuestions = 0;
              if (
                exam.practice_tests_list &&
                Array.isArray(exam.practice_tests_list) &&
                exam.practice_tests_list.length > 0
              ) {
                totalQuestions = exam.practice_tests_list.reduce((sum, test) => {
                  const testQuestions = parseInt(test.questions) || 0;
                  return sum + testQuestions;
                }, 0);
                if (!totalQuestions) totalQuestions = exam.questions || 0;
              } else {
                totalQuestions = exam.questions || 0;
              }

              return (
                <div
                  key={exam.id || index}
                  className="bg-white border border-[#DDE7FF] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-[0_6px_20px_rgba(26,115,232,0.15)] hover:-translate-y-1 transition-all shadow-[0_2px_8px_rgba(26,115,232,0.08)]"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-[#1A73E8]/10 flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-[#1A73E8]" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3
                          className="font-bold text-[#0C1A35] text-lg"
                          data-translate={exam.title || ""}
                          suppressHydrationWarning
                        >
                          {exam.title}
                        </h3>

                        <Badge
                          variant="outline"
                          className="text-xs border-[#D3E3FF] text-[#0C1A35] font-medium"
                        >
                          {exam.code}
                        </Badge>
                      </div>

                      <p
                        className="text-sm text-[#0C1A35]/60 mb-2"
                        data-translate={exam.provider || ""}
                        suppressHydrationWarning
                      >
                        {exam.provider}
                      </p>

                      <div className="flex items-center gap-4 flex-wrap">
                        {exam.badge && (
                          <Badge
                            className="bg-[#1A73E8]/10 text-[#1A73E8] text-xs"
                            data-translate={exam.badge}
                            suppressHydrationWarning
                          >
                            {exam.badge}
                          </Badge>
                        )}

                        <p className="text-sm text-[#0C1A35]/60">
                          <span>{practiceCount}</span>{" "}
                          <Trans i18nKey="home.featured.practice_exams" />
                          {" · "}
                          <span>{totalQuestions}</span>{" "}
                          <Trans i18nKey="home.featured.questions" />
                        </p>
                      </div>
                    </div>
                  </div>

                  {(exam.slug || exam.provider || exam.title) && (
                    <Button
                      size="default"
                      className="bg-[#1A73E8] text-white hover:bg-[#1557B0] whitespace-nowrap"
                      asChild
                    >
                      <Link href={getExamUrl(exam)}>
                        <Trans i18nKey="home.recent.practice_now" />
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
