// "use client";

// import { useState, useEffect, useCallback, useRef } from "react";
// import { Gift, Clock, Brain, CheckCircle, Users, FileText, ChevronLeft, ChevronRight } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import ItemListJsonLd from "@/components/ItemListJsonLd";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// // Icon mapping
// const iconMap = {
//   Gift,
//   Clock,
//   Brain,
//   CheckCircle,
//   Users,
//   FileText,
// };

// export default function ValuePropositions() {
//   const [features, setFeatures] = useState([]);
//   const [section, setSection] = useState({
//     heading: "Why Choose AllExamQuestions?",
//     subtitle: "Everything you need to ace your certification exam in one place",
//     heading_font_family: "font-bold",
//     heading_font_size: "text-4xl",
//     heading_color: "text-[#0C1A35]",
//     subtitle_font_size: "text-lg",
//     subtitle_color: "text-[#0C1A35]/70"
//   });
//   const [loading, setLoading] = useState(true);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const carouselRef = useRef(null);
//   const isMounted = useRef(true);

//   const fetchData = useCallback(async () => {
//     try {
//       // Fetch section settings and value propositions in parallel
//       const [sectionRes, propositionsRes] = await Promise.all([
//         fetch(`${API_BASE_URL}/api/home/value-propositions-section/`),
//         fetch(`${API_BASE_URL}/api/home/value-propositions/`)
//       ]);

//       const [sectionData, propositionsData] = await Promise.all([
//         sectionRes.json(),
//         propositionsRes.json()
//       ]);

//       if (!isMounted.current) return;

//       // Update section settings
//       if (sectionData.success && sectionData.data) {
//         setSection(sectionData.data);
//         }
    
//       // Update value propositions
//       if (propositionsData.success && propositionsData.data) {
//         // Backend already filters by is_active=True, but add extra safety check
//         const activeFeatures = propositionsData.data.filter(f => f.is_active !== false);
//           setFeatures(activeFeatures);
//         }
//     } catch (err) {
//       console.error("Error fetching value propositions data:", err);
//     } finally {
//       if (isMounted.current) {
//         setLoading(false);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     isMounted.current = true;
//     fetchData();

//     return () => {
//       isMounted.current = false;
//     };
//   }, [fetchData]);

//   // Items to show at once (responsive)
//   const [itemsPerView, setItemsPerView] = useState(3);

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth < 768) {
//         setItemsPerView(1);
//       } else if (window.innerWidth < 1024) {
//         setItemsPerView(2);
//       } else {
//         setItemsPerView(3);
//       }
//     };

//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const maxIndex = Math.max(0, features.length - itemsPerView);

//   const handlePrev = () => {
//     setCurrentIndex((prev) => Math.max(0, prev - 1));
//   };

//   const handleNext = () => {
//     setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
//   };

//   if (loading) {
//     return (
//       <section className="py-12 md:py-20 bg-[#0F1F3C]/10">
//         <div className="container mx-auto px-4 text-center">
//           <p className="text-[#0C1A35]/70 text-sm md:text-base">Loading...</p>
//         </div>
//       </section>
//     );
//   }

//   if (!features.length) {
//     return null; // Hide section if no active value propositions
//   }

//   // Prepare items for schema
//   const schemaItems = features.map((feature) => ({
//     title: feature.title || feature.heading || "",
//     description: feature.description || feature.text || "",
//   }));

//   return (
//     <section className="py-12 md:py-20 bg-[#0F1F3C]/10">
//       {features.length > 0 && (
//         <ItemListJsonLd
//           items={schemaItems}
//           listName={section.heading || "Why Choose AllExamQuestions?"}
//           itemType="Thing"
//           schemaId="value-propositions-json-ld-schema"
//         />
//       )}
//       <div className="container mx-auto px-4">
//         <h2 className={`text-2xl sm:text-3xl md:${section.heading_font_size} ${section.heading_font_family} ${section.heading_color} text-center mb-3 md:mb-4 px-2`}>
//           {section.heading}
//         </h2>

//         <p className={`text-center ${section.subtitle_color} text-sm sm:text-base md:${section.subtitle_font_size} mb-8 md:mb-12 max-w-2xl mx-auto px-2`}>
//           {section.subtitle}
//         </p>

//         {/* Carousel Container */}
//         <div className="relative">
//           {/* Navigation Buttons */}
//           {features.length > itemsPerView && (
//             <>
//               <Button
//                 onClick={handlePrev}
//                 disabled={currentIndex === 0}
//                 className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full w-12 h-12 bg-white hover:bg-gray-100 text-[#1A73E8] shadow-lg disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200"
//                 size="icon"
//               >
//                 <ChevronLeft className="w-6 h-6" />
//               </Button>
//               <Button
//                 onClick={handleNext}
//                 disabled={currentIndex >= maxIndex}
//                 className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full w-12 h-12 bg-white hover:bg-gray-100 text-[#1A73E8] shadow-lg disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200"
//                 size="icon"
//               >
//                 <ChevronRight className="w-6 h-6" />
//               </Button>
//             </>
//           )}

//           {/* Carousel Track */}
//           <div className="overflow-hidden" ref={carouselRef}>
//             <div
//               className="flex transition-transform duration-500 ease-in-out gap-6"
//               style={{
//                 transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
//               }}
//             >
//           {features.map((feature, index) => {
//             const Icon = iconMap[feature.icon] || Gift;
//             return (
//                   <div
//                 key={feature.id || index}
//                     className="flex-shrink-0"
//                     style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 24 / itemsPerView}px)` }}
//               >
//                     <Card className="border-[#D3E3FF] bg-white hover:shadow-[0_8px_24px_rgba(26,115,232,0.15)] transition-shadow h-full">
//                 <CardContent className="p-6 text-center space-y-4">
//                   <div className="w-16 h-16 rounded-full bg-[#1A73E8]/10 flex items-center justify-center mx-auto">
//                     <Icon className="w-8 h-8 text-[#1A73E8]" />
//                   </div>

//                   <h3 className="text-xl font-bold text-[#0C1A35]">
//                     {feature.title}
//                   </h3>

//                   <p className="text-[#0C1A35]/70">
//                     {feature.description}
//                   </p>
//                 </CardContent>
//               </Card>
//                   </div>
//             );
//           })}
//             </div>
//           </div>

//           {/* Dots Indicator */}
//           {features.length > itemsPerView && (
//             <div className="flex justify-center gap-2 mt-8">
//               {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => setCurrentIndex(idx)}
//                   className={`w-2 h-2 rounded-full transition-all ${
//                     idx === currentIndex
//                       ? "bg-[#1A73E8] w-8"
//                       : "bg-gray-300 hover:bg-gray-400"
//                   }`}
//                   aria-label={`Go to slide ${idx + 1}`}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }




"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useCarouselItemsPerView } from "@/hooks/useCarouselItemsPerView";
import {
  Gift,
  Clock,
  Brain,
  CheckCircle,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { REACT_I18N_ATTR } from "@/lib/domI18nUtils";

const iconMap = {
  Gift,
  Clock,
  Brain,
  CheckCircle,
  Users,
  FileText,
};

const gradientMap = [
  "from-[#EEF4FF] via-[#F8FAFF] to-[#FFFFFF]",
  "from-[#F3EEFF] via-[#FAF8FF] to-[#FFFFFF]",
  "from-[#ECFFF7] via-[#F7FFFB] to-[#FFFFFF]",
  "from-[#FFF4EC] via-[#FFF9F5] to-[#FFFFFF]",
  "from-[#F0F9FF] via-[#F8FCFF] to-[#FFFFFF]",
  "from-[#FFF1F8] via-[#FFF8FB] to-[#FFFFFF]",
];

const iconBgMap = [
  "bg-[#1A73E8]/10 text-[#1A73E8]",
  "bg-[#7C3AED]/10 text-[#7C3AED]",
  "bg-[#059669]/10 text-[#059669]",
  "bg-[#EA580C]/10 text-[#EA580C]",
  "bg-[#0891B2]/10 text-[#0891B2]",
  "bg-[#DB2777]/10 text-[#DB2777]",
];

const GAP_PX = 20;

function isInteractiveCarouselTarget(target) {
  if (!target || typeof target.closest !== "function") return false;
  return Boolean(
    target.closest('a, button, input, textarea, select, [role="button"]')
  );
}

export default function ValuePropositionsClient({ section, features }) {
  const { lt } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = useCarouselItemsPerView(3);
  const scrollRef = useRef(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  const maxIndex = Math.max(0, features.length - itemsPerView);

  const heading = section?.heading || "";
  const subtitle = section?.subtitle || "";

  const getStepWidth = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 0;
    const card = el.querySelector("[data-carousel-card]");
    if (!card) return 0;
    return card.getBoundingClientRect().width + GAP_PX;
  }, []);

  const scrollToIndex = useCallback(
    (index, behavior = "smooth") => {
      const el = scrollRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(maxIndex, index));
      const step = getStepWidth();
      if (step <= 0) return;
      el.scrollTo({ left: clamped * step, behavior });
      setCurrentIndex(clamped);
    },
    [getStepWidth, maxIndex]
  );

  const handlePrev = () => scrollToIndex(currentIndex - 1);
  const handleNext = () => scrollToIndex(currentIndex + 1);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const step = getStepWidth();
      if (step <= 0) return;
      const idx = Math.round(el.scrollLeft / step);
      setCurrentIndex(Math.max(0, Math.min(maxIndex, idx)));
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [getStepWidth, maxIndex, features.length, itemsPerView]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ left: 0, behavior: "auto" });
    setCurrentIndex(0);
  }, [itemsPerView, features.length]);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    if (isInteractiveCarouselTarget(e.target)) {
      dragRef.current.active = false;
      dragRef.current.moved = false;
      return;
    }
    const el = scrollRef.current;
    if (!el) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 8) dragRef.current.moved = true;
    if (dragRef.current.moved) {
      e.preventDefault();
      el.scrollLeft = dragRef.current.scrollLeft - dx;
    }
  };

  const onPointerUp = (e) => {
    const el = scrollRef.current;
    if (!dragRef.current.active) return;
    const wasDrag = dragRef.current.moved;
    dragRef.current.active = false;
    dragRef.current.moved = false;
    try {
      el?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (el) {
      const step = getStepWidth();
      if (step > 0) {
        const idx = Math.round(el.scrollLeft / step);
        scrollToIndex(idx, wasDrag ? "smooth" : "auto");
      }
    }
  };

  const cardWidthPercent = 100 / itemsPerView;
  const cardWidthCalc = `calc(${cardWidthPercent}% - ${
    ((itemsPerView - 1) * GAP_PX) / itemsPerView
  }px)`;

  return (
    <div className="container mx-auto px-4">
      {/* Heading */}
      <h2
        className={`text-2xl sm:text-3xl md:${
          section.heading_font_size || "text-4xl"
        } ${section.heading_font_family || "font-bold"} ${
          section.heading_color || "text-[#0C1A35]"
        } text-center mb-3 md:mb-4`}
        {...{ [REACT_I18N_ATTR]: "" }}
      >
        {lt("cms.value.heading", heading)}
      </h2>

      <p
        className={`text-center ${
          section.subtitle_color || "text-[#0C1A35]/70"
        } text-sm sm:text-base md:${
          section.subtitle_font_size || "text-lg"
        } mb-8 md:mb-12 max-w-2xl mx-auto`}
        {...{ [REACT_I18N_ATTR]: "" }}
      >
        {lt("cms.value.subtitle", subtitle)}
      </p>

      {/* Carousel */}
      <div className="relative">
        {/* Buttons */}
        {features.length > itemsPerView && (
          <>
            <Button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full w-11 h-11 min-h-[44px] min-w-[44px] bg-white text-[#1A73E8] shadow-md border disabled:opacity-30"
              size="icon"
              aria-label="Show previous value propositions"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden />
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full w-11 h-11 min-h-[44px] min-w-[44px] bg-white text-[#1A73E8] shadow-md border disabled:opacity-30"
              size="icon"
              aria-label="Show next value propositions"
            >
              <ChevronRight className="w-5 h-5" aria-hidden />
            </Button>
          </>
        )}

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label="Value propositions carousel"
        >
            {features.map((feature, index) => {
              const Icon =
                iconMap[feature.icon] || Gift;

              return (
                <div
                  key={feature.id || index}
                  data-carousel-card
                  className="flex-shrink-0 snap-start"
                  style={{ width: cardWidthCalc }}
                >
                  <Card
                    className={`
                      group relative overflow-hidden
                      border border-white/60
                      bg-gradient-to-br ${
                        gradientMap[index % gradientMap.length]
                      }
                      hover:-translate-y-1 hover:shadow-xl
                      transition-all duration-300
                      rounded-2xl h-full
                    `}
                  >
                    <CardContent className="p-5 md:p-6 text-center flex flex-col h-full">
                      {/* Icon */}
                      <div
                        className={`
                          w-14 h-14 rounded-xl
                          flex items-center justify-center mx-auto mb-4
                          ${iconBgMap[index % iconBgMap.length]}
                        `}
                      >
                        <Icon className="w-7 h-7" />
                      </div>

                      {/* Title */}
                      <h3
                        className="text-lg md:text-xl font-bold text-[#0F172A] mb-3"
                        {...{ [REACT_I18N_ATTR]: "" }}
                      >
                        {lt(`cms.value.${feature.id}.title`, feature.title)}
                      </h3>

                      <p
                        className="text-[#475569] text-sm md:text-base leading-relaxed flex-grow"
                        {...{ [REACT_I18N_ATTR]: "" }}
                      >
                        {lt(
                          `cms.value.${feature.id}.description`,
                          feature.description
                        )}
                      </p>

                      <div className="mt-5 flex justify-center">
                        <div className="w-10 h-1 bg-[#1A73E8]/40 rounded-full group-hover:w-16 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
        </div>

        {/* DOTS */}
        {features.length > itemsPerView && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map(
              (_, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => scrollToIndex(idx)}
                  aria-label={`Go to slide ${idx + 1} of ${maxIndex + 1}`}
                  aria-current={idx === currentIndex ? "true" : "false"}
                  className="min-h-[44px] min-w-[14px] flex items-center justify-center"
                >
                  <span
                    className={`block rounded-full transition-all ${
                      idx === currentIndex
                        ? "bg-[#1A73E8] w-8 h-2"
                        : "bg-gray-300 w-2 h-2"
                    }`}
                  />
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}