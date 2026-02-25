// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Star, ChevronLeft, ChevronRight } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import TestimonialsJsonLd from "@/components/TestimonialsJsonLd";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// const Testimonials = () => {
//   const [testimonials, setTestimonials] = useState([]);
//   const [sectionSettings, setSectionSettings] = useState({
//     heading: "Success Stories From Real Learners",
//     subtitle: "Real experiences from professionals who passed using AllExamQuestions",
//   });
//   const [loading, setLoading] = useState(true);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const carouselRef = useRef(null);

//   useEffect(() => {
//     // Fetch section settings
//     fetch(`${API_BASE_URL}/api/home/testimonials-section/`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success && data.data) {
//           setSectionSettings(data.data);
//         }
//       })
//       .catch((err) => console.error("Error fetching section settings:", err));
    
//     fetch(`${API_BASE_URL}/api/home/testimonials/`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success && data.data) {
//           // Filter already happens on backend, but double-check
//           const activeTestimonials = data.data.filter(t => t.is_active !== false);
//           setTestimonials(activeTestimonials);
//         }
//       })
//       .catch((err) => console.error("Error fetching testimonials:", err))
//       .finally(() => setLoading(false));
//   }, []);

//   // Items to show at once (responsive)
//   const [itemsPerView, setItemsPerView] = useState(4);

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth < 768) {
//         setItemsPerView(1);
//       } else if (window.innerWidth < 1024) {
//         setItemsPerView(2);
//       } else {
//         setItemsPerView(4);
//       }
//     };

//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const maxIndex = Math.max(0, testimonials.length - itemsPerView);

//   const handlePrev = () => {
//     setCurrentIndex((prev) => Math.max(0, prev - 1));
//   };

//   const handleNext = () => {
//     setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
//   };

//   if (loading) {
//     return (
//       <section className="py-12 md:py-20 bg-gradient-to-br from-[#F5F8FC] to-white">
//         <div className="container mx-auto px-4 text-center">
//           <p className="text-[#0C1A35]/70 text-sm md:text-base">Loading testimonials...</p>
//         </div>
//       </section>
//     );
//   }

//   if (!testimonials.length) {
//     return null; // Hide section if no testimonials
//   }

//   return (
//     <section className="py-12 md:py-20 bg-[#0B1A35]">
//       {testimonials.length > 0 && <TestimonialsJsonLd testimonials={testimonials} />}
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-8 md:mb-12">
//           <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-white px-2">
//             {sectionSettings.heading || "Success Stories From Real Learners"}
//           </h2>
//           {sectionSettings.subtitle && (
//             <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-3xl mx-auto px-2">
//               {sectionSettings.subtitle}
//             </p>
//           )}
//         </div>

//         {/* Carousel Container */}
//         <div className="relative">
//           {/* Navigation Buttons */}
//           {testimonials.length > itemsPerView && (
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
//               {testimonials.map((testimonial, index) => (
//                 <div
//                   key={testimonial.id || index}
//                   className="flex-shrink-0"
//                   style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 24 / itemsPerView}px)` }}
//                 >
//                   <Card
//                     className="border-none bg-white hover:shadow-[0_8px_24px_rgba(255,255,255,0.2)] transition-all duration-300 hover:-translate-y-1 h-full"
//                   >
//                     <CardContent className="p-6 space-y-4">
//                       {/* Avatar and Name */}
//                       <div className="flex flex-col items-center text-center gap-3">
//                         <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1A73E8] to-purple-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
//                           {testimonial.name.charAt(0).toUpperCase()}
//                         </div>
//                         <div>
//                           <h3 className="font-bold text-[#0C1A35] text-lg">{testimonial.name}</h3>
//                           <p className="text-sm text-[#0C1A35]/60">{testimonial.role}</p>
//                         </div>
//                       </div>

//                       {/* Rating */}
//                       <div className="flex gap-1 justify-center">
//                         {[...Array(5)].map((_, i) => (
//                           <Star
//                             key={i}
//                             className={`w-4 h-4 ${
//                               i < (testimonial.rating || 5)
//                                 ? "fill-[#1A73E8] text-[#1A73E8]"
//                                 : "text-gray-300"
//                             }`}
//                           />
//                         ))}
//                       </div>

//                       {/* Testimonial Text */}
//                       <p className="text-[#0C1A35]/70 text-center text-sm leading-relaxed">
//                         "{testimonial.review || testimonial.text}"
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Dots Indicator */}
//           {testimonials.length > itemsPerView && (
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
// };

// export default Testimonials;


"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TestimonialsClient({ testimonials, section }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const carouselRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  return (
    <section className="py-12 md:py-20 bg-[#0B1A35]">
      <div className="container mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {section.heading}
          </h2>

          {section.subtitle && (
            <p className="text-white/80 max-w-3xl mx-auto">
              {section.subtitle}
            </p>
          )}
        </div>

        <div className="relative">

          {testimonials.length > itemsPerView && (
            <>
              <Button
                onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full w-12 h-12 bg-white text-[#1A73E8]"
                size="icon"
              >
                <ChevronLeft />
              </Button>

              <Button
                onClick={() => setCurrentIndex((p) => Math.min(maxIndex, p + 1))}
                disabled={currentIndex >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full w-12 h-12 bg-white text-[#1A73E8]"
                size="icon"
              >
                <ChevronRight />
              </Button>
            </>
          )}

          {/* Track */}
          <div className="overflow-hidden" ref={carouselRef}>
            <div
              className="flex transition-transform duration-500 gap-6"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {testimonials.map((t, index) => (
                <div
                  key={t.id || index}
                  className="flex-shrink-0"
                  style={{
                    width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) *
                      24 /
                      itemsPerView}px)`,
                  }}
                >
                  <Card className="bg-white h-full">
                    <CardContent className="p-6 space-y-4">

                      <div className="flex flex-col items-center text-center gap-3">

                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1A73E8] to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                          {t.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <h3 className="font-bold text-[#0C1A35] text-lg">
                            {t.name}
                          </h3>
                          <p className="text-sm text-[#0C1A35]/60">{t.role}</p>
                        </div>

                      </div>

                      {/* Stars */}
                      <div className="flex gap-1 justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (t.rating || 5)
                                ? "fill-[#1A73E8] text-[#1A73E8]"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-[#0C1A35]/70 text-center text-sm">
                        "{t.review || t.text}"
                      </p>

                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
