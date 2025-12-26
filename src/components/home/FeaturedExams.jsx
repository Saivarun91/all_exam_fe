"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Award, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getExamUrl } from "@/lib/utils";

const FeaturedExams = () => {
  const [courses, setCourses] = useState([]);
  const [sectionSettings, setSectionSettings] = useState({
    heading: "Featured Exams",
    subtitle: "",
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    // Fetch section settings
    fetch(`${API_BASE_URL}/api/home/featured-exams-section/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSectionSettings(data.data);
        }
      })
      .catch((err) => console.error("Error fetching section settings:", err));
    
    // Fetch only featured courses
    fetch(`${API_BASE_URL}/api/courses/featured/`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter only active and featured courses
          const featuredCourses = data.filter(course => course.is_active !== false && course.is_featured !== false);
          setCourses(featuredCourses);
        }
      })
      .catch((err) => console.error("Error fetching featured courses:", err));
  }, [API_BASE_URL]);

  // Items to show at once (responsive)
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, courses.length - itemsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  if (!courses.length) {
    return null; // Hide section if no active courses
  }

  return (
    <section id="featured-exams" className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4 text-[#0C1A35] px-2">
          {sectionSettings.heading || "Featured Exams"}
        </h2>
        {sectionSettings.subtitle && (
          <p className="text-center text-[#0C1A35]/70 text-sm sm:text-base md:text-lg mb-8 md:mb-12 max-w-2xl mx-auto px-2">
            {sectionSettings.subtitle}
          </p>
        )}

        {courses.length === 0 && (
          <p className="text-center text-[#0C1A35]/60">No featured exams available.</p>
        )}

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          {courses.length > itemsPerView && (
            <>
              <Button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full w-12 h-12 bg-white hover:bg-gray-100 text-[#1A73E8] shadow-lg disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200"
                size="icon"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full w-12 h-12 bg-white hover:bg-gray-100 text-[#1A73E8] shadow-lg disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200"
                size="icon"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Carousel Track */}
          <div className="overflow-hidden" ref={carouselRef}>
            <div
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {courses.map((exam, index) => (
                <div
                  key={index}
                  className="flex-shrink-0"
                  style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 24 / itemsPerView}px)` }}
                >
                  <Card
                    className="hover:shadow-[0_6px_20px_rgba(26,115,232,0.15)] hover:-translate-y-1 transition-all duration-300 border-[#DDE7FF] group cursor-pointer bg-white shadow-[0_2px_8px_rgba(26,115,232,0.08)] h-full"
                  >
                    <CardContent className="p-6 space-y-4 flex flex-col h-full">
                      {/* Top: Icon + Badge */}
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-lg bg-[#1A73E8]/10 flex items-center justify-center flex-shrink-0">
                          <Award className="w-6 h-6 text-[#1A73E8]" />
                        </div>
                        {exam.badge && (
                          <Badge
                            variant="secondary"
                            className="bg-[#1A73E8]/10 text-[#1A73E8] text-xs font-medium"
                          >
                            {exam.badge}
                          </Badge>
                        )}
                      </div>

                      {/* Middle: Exam Info */}
                      <div className="flex-grow space-y-1">
                        {/* Provider */}
                        <p className="text-sm text-[#0C1A35]/60 font-medium">
                          {exam.provider || "Unknown Provider"}
                        </p>
                        
                        {/* Exam Title */}
                        <h3 className="text-xl font-bold text-[#0C1A35] leading-tight">
                          {exam.title || "Untitled Exam"}
                        </h3>
                        
                        {/* Exam Code */}
                        <p className="text-sm text-[#0C1A35]/60">{exam.code || "N/A"}</p>
                      </div>

                      {/* Bottom: Stats + Button */}
                      <div className="pt-2 space-y-4">
                        {/* Practice Exams & Questions */}
                        <p className="text-sm text-[#0C1A35]/60">
                          {exam.practice_exams || 0} Practice Exams · {exam.questions || 0} Questions
                        </p>

                        {/* Pricing */}
                        {(exam.offer_price > 0 || exam.actual_price > 0) && (
                          <div className="flex items-center gap-2">
                            {exam.offer_price > 0 && (
                              <span className="text-2xl font-bold text-[#1A73E8]">
                                ₹{exam.offer_price}
                              </span>
                            )}
                            {exam.actual_price > 0 && exam.actual_price !== exam.offer_price && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{exam.actual_price}
                              </span>
                            )}
                            {exam.offer_price > 0 && exam.actual_price > exam.offer_price && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                {Math.round(((exam.actual_price - exam.offer_price) / exam.actual_price) * 100)}% OFF
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Start Practicing Button */}
                        <Button
                          className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0] group-hover:shadow-[0_4px_14px_rgba(26,115,232,0.4)] transition-all"
                          asChild
                        >
                          <Link href={getExamUrl(exam)}>
                            Start Practicing
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          {courses.length > itemsPerView && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? "bg-[#1A73E8] w-8"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedExams;
