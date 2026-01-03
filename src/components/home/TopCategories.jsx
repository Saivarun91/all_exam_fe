"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, Shield, Briefcase, Database, Code, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ItemListJsonLd from "@/components/ItemListJsonLd";

const ICON_MAP = {
  Cloud,
  Shield,
  Briefcase,
  Database,
  Code,
  TrendingUp,
};

export default function TopCategories() {
  const [categories, setCategories] = useState([]);
  const [sectionSettings, setSectionSettings] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  // Fetch categories and section settings
  useEffect(() => {
    // Fetch categories
    fetch(`${API_BASE_URL}/api/categories/`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(() => console.error("Failed to fetch categories"));

    // Fetch section settings
    fetch(`${API_BASE_URL}/api/home/top-categories-section/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSectionSettings(data.data);
        }
      })
      .catch(() => console.error("Failed to fetch section settings"));
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

  const maxIndex = Math.max(0, categories.length - itemsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const settings = sectionSettings || {
    heading: "Top Certification Categories",
    subtitle: "Explore certifications by category",
    heading_font_family: "font-bold",
    heading_font_size: "text-4xl",
    heading_color: "text-[#0C1A35]",
    subtitle_font_size: "text-lg",
    subtitle_color: "text-[#0C1A35]/70",
  };

  // Prepare items for schema
  const schemaItems = categories.map((cat) => ({
    name: cat.name,
    description: cat.description || "",
    url: `/categories/${cat.slug}`,
  }));

  return (
    <section className="py-12 md:py-20 bg-[#F5F8FC]">
      {categories.length > 0 && (
        <ItemListJsonLd
          items={schemaItems}
          listName={settings.heading || "Top Certification Categories"}
          itemType="Category"
          schemaId="top-categories-json-ld-schema"
        />
      )}
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className={`text-2xl sm:text-3xl md:${settings.heading_font_size} ${settings.heading_font_family} ${settings.heading_color} mb-3 md:mb-4`}>
            {settings.heading}
          </h2>
          {settings.subtitle && (
            <p className={`text-sm sm:text-base md:${settings.subtitle_font_size} ${settings.subtitle_color} max-w-2xl mx-auto px-2`}>
              {settings.subtitle}
            </p>
          )}
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          {categories.length > itemsPerView && (
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
              {categories.map((category, index) => {
                const Icon = ICON_MAP[category.icon] || Cloud;

                return (
                  <div
                    key={index}
                    className="flex-shrink-0"
                    style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 24 / itemsPerView}px)` }}
                  >
                    <Card
                      className="hover:shadow-[0_8px_24px_rgba(26,115,232,0.15)] hover:-translate-y-1 transition-all cursor-pointer border-[#DDE7FF] bg-white h-full"
                      onClick={() => router.push(`/categories/${category.slug}`)}
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="w-12 h-12 rounded-lg bg-[#1A73E8]/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-[#1A73E8]" />
                        </div>

                        <h3 className="text-xl font-bold text-[#0C1A35]">
                          {category.title}
                        </h3>

                        <p className="text-[#0C1A35]/70 line-clamp-2">
                          {category.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots Indicator */}
          {categories.length > itemsPerView && (
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
}
