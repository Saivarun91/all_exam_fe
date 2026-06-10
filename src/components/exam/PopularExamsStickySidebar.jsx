import Link from "next/link";
import { Award, ChevronRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const POPULAR_EXAM_ACCENTS = [
  {
    card: "from-[#eff6ff] via-white to-[#eef2ff] border-[#93c5fd]/40 hover:border-[#1A73E8]/50",
    bar: "bg-gradient-to-b from-[#1A73E8] to-[#3b82f6]",
    icon: "bg-[#1A73E8]/15 text-[#1A73E8]",
    badge: "bg-[#1A73E8]/12 text-[#1A73E8]",
    cta: "text-[#1A73E8] group-hover:text-[#1557B0]",
  },
  {
    card: "from-violet-50 via-white to-indigo-50 border-violet-200/70 hover:border-violet-400/60",
    bar: "bg-gradient-to-b from-violet-600 to-indigo-500",
    icon: "bg-violet-100 text-violet-700",
    badge: "bg-violet-100 text-violet-800",
    cta: "text-violet-700 group-hover:text-violet-900",
  },
  {
    card: "from-emerald-50 via-white to-teal-50 border-emerald-200/70 hover:border-emerald-400/60",
    bar: "bg-gradient-to-b from-emerald-600 to-teal-500",
    icon: "bg-emerald-100 text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800",
    cta: "text-emerald-700 group-hover:text-emerald-900",
  },
  {
    card: "from-amber-50 via-white to-orange-50 border-amber-200/70 hover:border-amber-400/60",
    bar: "bg-gradient-to-b from-amber-500 to-orange-500",
    icon: "bg-amber-100 text-amber-800",
    badge: "bg-amber-100 text-amber-900",
    cta: "text-amber-800 group-hover:text-amber-950",
  },
];

export default function PopularExamsStickySidebar({
  exams = [],
  sticky = true,
}) {
  if (!exams.length) return null;

  return (
    <Card
      className={`border-[#DDE7FF] shadow-sm ${sticky ? "sticky top-24 z-10" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1A73E8] to-violet-600 shadow-sm">
            <Sparkles className="w-4 h-4 text-white" aria-hidden />
          </span>
          <div>
            <CardTitle className="text-base text-[#0C1A35] leading-tight">
              Popular Exams
            </CardTitle>
            <p className="text-[11px] text-[#0C1A35]/55 mt-0.5">
              Same exams as Featured on home
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2.5 max-h-[min(70vh,560px)] overflow-y-auto pr-0.5">
          {exams.map((exam, index) => {
            const accent =
              POPULAR_EXAM_ACCENTS[index % POPULAR_EXAM_ACCENTS.length];

            return (
              <Link
                key={exam.id}
                href={exam.href}
                className={`group relative flex overflow-hidden rounded-xl border bg-gradient-to-br p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${accent.card}`}
              >
                <span
                  className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${accent.bar}`}
                  aria-hidden
                />
                <div className="flex min-w-0 flex-1 items-start gap-2.5 pl-2">
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent.icon}`}
                  >
                    <Award className="w-4 h-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0C1A35]/50 truncate">
                      {exam.provider || "Provider"}
                    </p>
                    <p className="text-sm font-bold text-[#0C1A35] leading-snug line-clamp-2 group-hover:text-[#1A73E8] transition-colors">
                      {exam.title}
                    </p>
                    {exam.code || exam.badge ? (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {exam.code ? (
                          <Badge
                            className={`border-0 text-[10px] font-semibold px-2 py-0 ${accent.badge}`}
                          >
                            {exam.code}
                          </Badge>
                        ) : null}
                        {exam.badge ? (
                          <Badge className="border-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] font-semibold px-2 py-0 shadow-sm">
                            {exam.badge}
                          </Badge>
                        ) : null}
                      </div>
                    ) : null}
                    <p
                      className={`mt-2 inline-flex items-center gap-0.5 text-xs font-semibold ${accent.cta}`}
                    >
                      Explore exam
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
