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

import { useState, useEffect, useRef } from "react";
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

const iconMap = {
  Gift,
  Clock,
  Brain,
  CheckCircle,
  Users,
  FileText,
};

export default function ValuePropositionsClient({ section, features }) {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const carouselRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, features.length - itemsPerView);

  return (
    <div className="container mx-auto px-4">

      <h2 className={`text-2xl sm:text-3xl md:${section.heading_font_size || "text-4xl"} ${section.heading_font_family || "font-bold"} ${section.heading_color || "text-[#0C1A35]"} text-center mb-3 md:mb-4 px-2`}>
        {section.heading}
      </h2>

      <p className={`text-center ${section.subtitle_color || "text-[#0C1A35]/70"} text-sm sm:text-base md:${section.subtitle_font_size || "text-lg"} mb-8 md:mb-12 max-w-2xl mx-auto px-2`}>
        {section.subtitle}
      </p>

      <div className="relative">

        {features.length > itemsPerView && (
          <>
            <Button
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              disabled={currentIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full w-12 h-12 bg-white text-[#1A73E8] shadow-lg border"
              size="icon"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              onClick={() =>
                setCurrentIndex((p) => Math.min(maxIndex, p + 1))
              }
              disabled={currentIndex >= maxIndex}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full w-12 h-12 bg-white text-[#1A73E8] shadow-lg border"
              size="icon"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        <div className="overflow-hidden" ref={carouselRef}>
          <div
            className="flex transition-transform duration-500 ease-in-out gap-6"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {features.map((feature, index) => {
              const Icon = iconMap[feature.icon] || Gift;

              return (
                <div
                  key={feature.id || index}
                  className="flex-shrink-0"
                  style={{
                    width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) *
                      24 /
                      itemsPerView}px)`,
                  }}
                >
                  <Card className="border-[#D3E3FF] bg-white hover:shadow-lg h-full">
                    <CardContent className="p-6 text-center space-y-4">

                      <div className="w-16 h-16 rounded-full bg-[#1A73E8]/10 flex items-center justify-center mx-auto">
                        <Icon className="w-8 h-8 text-[#1A73E8]" />
                      </div>

                      <h3 className="text-xl font-bold text-[#0C1A35]">
                        {feature.title}
                      </h3>

                      <p className="text-[#0C1A35]/70">
                        {feature.description}
                      </p>

                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {features.length > itemsPerView && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full ${
                  idx === currentIndex
                    ? "bg-[#1A73E8] w-8"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}