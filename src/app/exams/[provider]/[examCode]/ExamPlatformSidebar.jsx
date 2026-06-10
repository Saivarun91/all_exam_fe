// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import {
//   Award,
//   ChevronRight,
//   FileText,
//   Sparkles,
// } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import StartTestButton from "./StartTestButton";
// import {
//   FEATURED_COURSES_API_PATH,
//   filterAdminFeaturedCourses,
// } from "@/lib/featuredCourses";
// import { getExamUrl } from "@/lib/utils";
// import avatarJohn from "@/assets/avatar-john.jpg";
// import avatarSarah from "@/assets/avatar-sarah.jpg";
// import avatarRaj from "@/assets/avatar-raj.jpg";

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// const SOCIAL_PROOF_AVATARS = [
//   "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80",
//   "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
//   "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&auto=format&fit=crop&q=80",
// ];

// function useAnimatedPercent(duration = 1400) {
//   const [value, setValue] = useState(0);

//   useEffect(() => {
//     const goal = 95;
//     setValue(0);

//     let frameId = 0;
//     const startTime = performance.now();

//     const tick = (now) => {
//       const progress = Math.min((now - startTime) / duration, 1);
//       const eased = 1 - Math.pow(1 - progress, 3);

//       if (progress >= 1) {
//         setValue(goal);
//         return;
//       }

//       setValue(Math.round(eased * goal));
//       frameId = requestAnimationFrame(tick);
//     };

//     frameId = requestAnimationFrame(tick);
//     return () => cancelAnimationFrame(frameId);
//   }, [duration]);

//   return value;
// }

// function SocialProofStrip() {
//   const animatedPercent = useAnimatedPercent();

//   return (
//     <div className="social-proof-strip flex items-center gap-3">
//       <div className="flex -space-x-2 shrink-0">
//         {SOCIAL_PROOF_AVATARS.map((src, i) => (
//           <Avatar
//             key={i}
//             className="social-proof-avatar w-8 h-8 border-2 border-white shadow-sm ring-2 ring-[#1A73E8]/25 transition-transform hover:scale-110 hover:z-10 hover:ring-[#1A73E8]/45"
//             style={{ "--avatar-delay": `${i * 0.12}s` }}
//           >
//             <AvatarImage
//               src={src}
//               alt="Professional student"
//               className="object-cover"
//             />
//             <AvatarFallback className="bg-[#1A73E8] text-white text-xs">
//               U
//             </AvatarFallback>
//           </Avatar>
//         ))}
//       </div>
//       <p className="text-sm leading-snug min-w-0">
//         <span
//           className="social-proof-percent font-bold text-[#1A73E8] text-base tabular-nums"
//           style={{ animationDelay: "0.35s" }}
//         >
//           {animatedPercent}%
//         </span>{" "}
//         <span className="social-proof-text font-semibold text-[#0C1A35]">
//           found the questions similar to the certification test
//         </span>
//       </p>
//     </div>
//   );
// }

// const POPULAR_EXAM_ACCENTS = [
//   {
//     card: "from-[#eff6ff] via-white to-[#eef2ff] border-[#93c5fd]/40 hover:border-[#1A73E8]/50",
//     bar: "bg-gradient-to-b from-[#1A73E8] to-[#3b82f6]",
//     icon: "bg-[#1A73E8]/15 text-[#1A73E8]",
//     badge: "bg-[#1A73E8]/12 text-[#1A73E8]",
//     cta: "text-[#1A73E8] group-hover:text-[#1557B0]",
//   },
//   {
//     card: "from-violet-50 via-white to-indigo-50 border-violet-200/70 hover:border-violet-400/60",
//     bar: "bg-gradient-to-b from-violet-600 to-indigo-500",
//     icon: "bg-violet-100 text-violet-700",
//     badge: "bg-violet-100 text-violet-800",
//     cta: "text-violet-700 group-hover:text-violet-900",
//   },
//   {
//     card: "from-emerald-50 via-white to-teal-50 border-emerald-200/70 hover:border-emerald-400/60",
//     bar: "bg-gradient-to-b from-emerald-600 to-teal-500",
//     icon: "bg-emerald-100 text-emerald-700",
//     badge: "bg-emerald-100 text-emerald-800",
//     cta: "text-emerald-700 group-hover:text-emerald-900",
//   },
//   {
//     card: "from-amber-50 via-white to-orange-50 border-amber-200/70 hover:border-amber-400/60",
//     bar: "bg-gradient-to-b from-amber-500 to-orange-500",
//     icon: "bg-amber-100 text-amber-800",
//     badge: "bg-amber-100 text-amber-900",
//     cta: "text-amber-800 group-hover:text-amber-950",
//   },
// ];

// function normalizeSegment(value = "") {
//   return String(value || "")
//     .trim()
//     .toLowerCase()
//     .replace(/_/g, "-")
//     .replace(/\s+/g, "-")
//     .replace(/-+/g, "-")
//     .replace(/^-+|-+$/g, "");
// }

// export default function ExamPlatformSidebar({
//   statCardTitle,
//   lastUpdatedLabel,
//   platformRows,
//   practiceUrl,
//   officialDetailsUrl,
//   hasOfficialDetails,
//   matchPercent,
// }) {
//   const showOfficialDetailsButton =
//     hasOfficialDetails === true &&
//     typeof officialDetailsUrl === "string" &&
//     officialDetailsUrl.trim() !== "";
//   const [popularExams, setPopularExams] = useState([]);

//   const currentExamKey = useMemo(() => {
//     const codeRow = platformRows?.find(
//       (r) => String(r.label || "").toLowerCase() === "exam code"
//     );
//     const providerRow = platformRows?.find(
//       (r) => String(r.label || "").toLowerCase() === "provider"
//     );
//     return `${normalizeSegment(providerRow?.value)}::${normalizeSegment(codeRow?.value)}`;
//   }, [platformRows]);

//   useEffect(() => {
//     let alive = true;

//     async function loadPopular() {
//       try {
//         // Same list used for the Home page "Featured Exams"
//         const res = await fetch(`${API_BASE_URL}${FEATURED_COURSES_API_PATH}`, {
//           cache: "no-store",
//         });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (!alive) return;

//         // Same full list as Home → Featured Exams (only hide the exam being viewed)
//         const list = filterAdminFeaturedCourses(data);
//         const normalized = list
//           .map((c) => {
//             const providerPart = normalizeSegment(
//               c?.provider_slug || c?.providerSlug || c?.provider
//             );
//             const codePart = normalizeSegment(c?.code || c?.exam_code || "");
//             const href = getExamUrl(c) || null;
//             return {
//               id: c?.id || `${providerPart}-${codePart}`,
//               title: c?.title || c?.name || codePart,
//               provider: c?.provider || "",
//               providerSlug: providerPart,
//               code: c?.code || c?.exam_code || "",
//               badge: c?.badge || "",
//               href,
//               _key: `${providerPart}::${codePart}`,
//             };
//           })
//           .filter((c) => c.href && c._key !== currentExamKey);

//         setPopularExams(normalized);
//       } catch {
//         // ignore
//       }
//     }

//     loadPopular();
//     return () => {
//       alive = false;
//     };
//   }, [currentExamKey]);
  

//   return (
//     <div className="relative sticky top-24">
//       <div className="absolute bottom-full left-0 right-0 pb-3">
//         <SocialProofStrip />
//       </div>

//     <Card className="border-[#DDE7FF] shadow-sm">
//       <CardHeader className="text-center pb-2">
//         <CardTitle className="text-[#0C1A35] text-lg leading-snug">
//           {statCardTitle}
//         </CardTitle>
//         {lastUpdatedLabel && (
//           <p className="text-sm text-[#0C1A35]/60 mt-2">
//             Last updated on {lastUpdatedLabel}
//           </p>
//         )}
//       </CardHeader>
//       <CardContent className="space-y-4 pt-0">
//         <div className="divide-y divide-[#DDE7FF]">
//           {platformRows.map((row) => (
//             <div
//               key={row.label}
//               className="flex justify-between gap-3 items-start py-3 first:pt-0"
//             >
//               <span className="text-sm font-semibold text-[#0C1A35] shrink-0">
//                 {row.label}
//               </span>
//               {row.isLink ? (
//                 <Link
//                   href={row.href}
//                   className="text-sm font-medium text-[#1A73E8] text-right hover:underline min-w-0 break-words"
//                 >
//                   {row.value}
//                 </Link>
//               ) : (
//                 <span className="text-sm text-[#0C1A35] text-right min-w-0 break-words">
//                   {row.value}
//                 </span>
//               )}
//             </div>
//           ))}
//         </div>

//         <StartTestButton
//           url={practiceUrl}
//           label="Start Practicing tests "
//           className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white h-12 text-base font-semibold rounded-lg"
//         />

//         {showOfficialDetailsButton ? (
//           <Button
//             asChild
//             className="w-full h-11 border-0 bg-gradient-to-r from-[#4338ca] via-[#4f46e5] to-[#6366f1] text-white font-semibold shadow-md"
//           >
//             <Link href={officialDetailsUrl} className="inline-flex items-center gap-2">
//               <FileText className="w-4 h-4" />
//               View Official Exam Details
//             </Link>
//           </Button>
//         ) : null}

//         {popularExams.length > 0 ? (
//           <div className="pt-4 border-t border-[#DDE7FF]">
//             <div className="flex items-center gap-2 mb-3">
//               <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1A73E8] to-violet-600 shadow-sm">
//                 <Sparkles className="w-4 h-4 text-white" aria-hidden />
//               </span>
//               <div>
//                 <p className="text-sm font-bold text-[#0C1A35] leading-tight">
//                   Popular Exams
//                 </p>
//                 <p className="text-[11px] text-[#0C1A35]/55">
//                   Same exams as Featured on home
//                 </p>
//               </div>
//             </div>

//             <div className="space-y-2.5 max-h-[min(70vh,560px)] overflow-y-auto pr-0.5">
//               {popularExams.map((exam, index) => {
//                 const accent =
//                   POPULAR_EXAM_ACCENTS[index % POPULAR_EXAM_ACCENTS.length];
//                 return (
//                   <Link
//                     key={exam.id}
//                     href={exam.href}
//                     className={`group relative flex overflow-hidden rounded-xl border bg-gradient-to-br p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${accent.card}`}
//                   >
//                     <span
//                       className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${accent.bar}`}
//                       aria-hidden
//                     />
//                     <div className="flex min-w-0 flex-1 items-start gap-2.5 pl-2">
//                       <span
//                         className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent.icon}`}
//                       >
//                         <Award className="w-4 h-4" aria-hidden />
//                       </span>
//                       <div className="min-w-0 flex-1">
//                         <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0C1A35]/50 truncate">
//                           {exam.provider || "Provider"}
//                         </p>
//                         <p className="text-sm font-bold text-[#0C1A35] leading-snug line-clamp-2 group-hover:text-[#1A73E8] transition-colors">
//                           {exam.title}
//                         </p>
//                         {exam.code || exam.badge ? (
//                           <div className="mt-2 flex flex-wrap items-center gap-1.5">
//                             {exam.code ? (
//                               <Badge
//                                 className={`border-0 text-[10px] font-semibold px-2 py-0 ${accent.badge}`}
//                               >
//                                 {exam.code}
//                               </Badge>
//                             ) : null}
//                             {exam.badge ? (
//                               <Badge className="border-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] font-semibold px-2 py-0 shadow-sm">
//                                 {exam.badge}
//                               </Badge>
//                             ) : null}
//                           </div>
//                         ) : null}
//                         <p
//                           className={`mt-2 inline-flex items-center gap-0.5 text-xs font-semibold ${accent.cta}`}
//                         >
//                           Explore exam
//                           <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
//                         </p>
//                       </div>
//                     </div>
//                   </Link>
//                 );
//               })}
//             </div>
//           </div>
//         ) : null}
//       </CardContent>
//     </Card>
//     </div>
//   );
// }





"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  ChevronRight,
  FileText,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StartTestButton from "./StartTestButton";
import {
  FEATURED_COURSES_API_PATH,
  filterAdminFeaturedCourses,
} from "@/lib/featuredCourses";
import { getExamUrl } from "@/lib/utils";
import avatarJohn from "@/assets/avatar-john.jpg";
import avatarSarah from "@/assets/avatar-sarah.jpg";
import avatarRaj from "@/assets/avatar-raj.jpg";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const SOCIAL_PROOF_AVATARS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&auto=format&fit=crop&q=80",
];

function useAnimatedPercent(duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const goal = 95;
    setValue(0);

    let frameId = 0;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      if (progress >= 1) {
        setValue(goal);
        return;
      }

      setValue(Math.round(eased * goal));
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [duration]);

  return value;
}

function SocialProofStrip() {
  const animatedPercent = useAnimatedPercent();

  return (
    <div className="social-proof-strip flex items-center gap-3">
      <div className="flex -space-x-2 shrink-0">
        {SOCIAL_PROOF_AVATARS.map((src, i) => (
          <Avatar
            key={i}
            className="social-proof-avatar w-8 h-8 border-2 border-white shadow-sm ring-2 ring-[#1A73E8]/25 transition-transform hover:scale-110 hover:z-10 hover:ring-[#1A73E8]/45"
            style={{ "--avatar-delay": `${i * 0.12}s` }}
          >
            <AvatarImage
              src={src}
              alt="Professional student"
              className="object-cover"
            />
            <AvatarFallback className="bg-[#1A73E8] text-white text-xs">
              U
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <p className="text-sm leading-snug min-w-0">
        <span
          className="social-proof-percent font-bold text-[#1A73E8] text-base tabular-nums"
          style={{ animationDelay: "0.35s" }}
        >
          {animatedPercent}%
        </span>{" "}
        <span className="social-proof-text font-semibold text-[#0C1A35]">
          found the questions similar to the certification test
        </span>
      </p>
    </div>
  );
}

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

function normalizeSegment(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ExamPlatformSidebar({
  statCardTitle,
  lastUpdatedLabel,
  platformRows,
  practiceUrl,
  officialDetailsUrl,
  hasOfficialDetails,
  matchPercent,
}) {
  const [popularExams, setPopularExams] = useState([]);

  const currentExamKey = useMemo(() => {
    const codeRow = platformRows?.find(
      (r) => String(r.label || "").toLowerCase() === "exam code"
    );
    const providerRow = platformRows?.find(
      (r) => String(r.label || "").toLowerCase() === "provider"
    );
    return `${normalizeSegment(providerRow?.value)}::${normalizeSegment(codeRow?.value)}`;
  }, [platformRows]);

  useEffect(() => {
    let alive = true;

    async function loadPopular() {
      try {
        const res = await fetch(`${API_BASE_URL}${FEATURED_COURSES_API_PATH}`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = await res.json();
        if (!alive) return;

        const list = filterAdminFeaturedCourses(data);

        const normalized = list
          .map((c) => {
            const providerPart = normalizeSegment(
              c?.provider_slug || c?.providerSlug || c?.provider
            );
            const codePart = normalizeSegment(c?.code || c?.exam_code || "");

            const href = getExamUrl(c) || null;

            return {
              id: c?.id || `${providerPart}-${codePart}`,
              title: c?.title || c?.name || codePart,
              provider: c?.provider || "",
              providerSlug: providerPart,
              code: c?.code || c?.exam_code || "",
              badge: c?.badge || "",
              href,
              _key: `${providerPart}::${codePart}`,
            };
          })
          .filter((c) => c.href && c._key !== currentExamKey);

        setPopularExams(normalized);
      } catch {
        // ignore
      }
    }

    loadPopular();
    return () => {
      alive = false;
    };
  }, [currentExamKey]);

  return (
    <div className="relative sticky top-24">
      <div className="absolute bottom-full left-0 right-0 pb-3">
        <SocialProofStrip />
      </div>

      <Card className="border-[#DDE7FF] shadow-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-[#0C1A35] text-lg leading-snug">
            {statCardTitle}
          </CardTitle>
          {lastUpdatedLabel && (
            <p className="text-sm text-[#0C1A35]/60 mt-2">
              Last updated on {lastUpdatedLabel}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          <div className="divide-y divide-[#DDE7FF]">
            {platformRows.map((row) => (
              <div
                key={row.label}
                className="flex justify-between gap-3 items-start py-3 first:pt-0"
              >
                <span className="text-sm font-semibold text-[#0C1A35] shrink-0">
                  {row.label}
                </span>

                {row.isLink ? (
                  <Link
                    href={row.href}
                    className="text-sm font-medium text-[#1A73E8] text-right hover:underline min-w-0 break-words"
                  >
                    {row.value}
                  </Link>
                ) : (
                  <span className="text-sm text-[#0C1A35] text-right min-w-0 break-words">
                    {row.value}
                  </span>
                )}
              </div>
            ))}
          </div>

          <StartTestButton
            url={practiceUrl}
            label="Start Practicing tests "
            className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white h-12 text-base font-semibold rounded-lg"
          />

          {hasOfficialDetails === true &&
          officialDetailsUrl &&
          officialDetailsUrl.trim().length > 0 ? (
            <Button
              asChild
              className="w-full h-11 border-0 bg-gradient-to-r from-[#4338ca] via-[#4f46e5] to-[#6366f1] text-white font-semibold shadow-md"
            >
              <Link href={officialDetailsUrl} className="inline-flex items-center gap-2">
                <FileText className="w-4 h-4" />
                View Official Exam Details
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="w-full h-11 border-0 bg-gradient-to-r from-[#4338ca] via-[#4f46e5] to-[#6366f1] text-white font-semibold shadow-none cursor-not-allowed"
              title="Official exam details are not available for this exam"
            >
              <span className="inline-flex items-center gap-2">
                <FileText className="w-4 h-4" />
                View Official Exam Details
              </span>
            </Button>
          )}

          {popularExams.length > 0 ? (
            <div className="pt-4 border-t border-[#DDE7FF]">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1A73E8] to-violet-600 shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#0C1A35] leading-tight">
                    Popular Exams
                  </p>
                  <p className="text-[11px] text-[#0C1A35]/55">
                    Same exams as Featured on home
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[min(70vh,560px)] overflow-y-auto pr-0.5">
                {popularExams.map((exam, index) => {
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
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}