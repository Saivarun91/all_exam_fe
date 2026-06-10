"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCarouselItemsPerView } from "@/hooks/useCarouselItemsPerView";
import CategoryCard from "@/components/category/CategoryCard";

const GAP_PX = 16;

function isInteractiveCarouselTarget(target) {
  if (!target || typeof target.closest !== "function") return false;
  return Boolean(
    target.closest('a, button, input, textarea, select, [role="button"]')
  );
}

export default function TopCategoriesClient({
  categories = [],
  sectionSettings,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = useCarouselItemsPerView(4);
  const scrollRef = useRef(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  const maxIndex = Math.max(0, categories.length - itemsPerView);

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
  }, [getStepWidth, maxIndex, categories.length, itemsPerView]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ left: 0, behavior: "auto" });
    setCurrentIndex(0);
  }, [itemsPerView, categories.length]);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    // Do not capture pointer on links/buttons — that blocks Next.js <Link> navigation.
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
    if (!wasDrag && el) {
      const step = getStepWidth();
      if (step > 0) {
        const idx = Math.round(el.scrollLeft / step);
        scrollToIndex(idx);
      }
    }
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

  const heading = settings.heading;
  const subtitle = settings.subtitle;

  const cardWidthPercent = 100 / itemsPerView;
  const cardWidthCalc = `calc(${cardWidthPercent}% - ${
    ((itemsPerView - 1) * GAP_PX) / itemsPerView
  }px)`;

  return (
    <section className="py-12 md:py-20 bg-[#F5F8FC]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2
            className={`text-2xl sm:text-3xl md:${settings.heading_font_size} ${settings.heading_font_family} ${settings.heading_color} mb-3 md:mb-4`}
            data-i18n="cms.categories.heading"
            data-i18n-fallback={heading}
          >
            {heading}
          </h2>
          {subtitle && (
            <p
              className={`text-sm sm:text-base md:${settings.subtitle_font_size} ${settings.subtitle_color} max-w-2xl mx-auto`}
              data-i18n="cms.categories.subtitle"
              data-i18n-fallback={subtitle}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div className="relative">
          {categories.length > itemsPerView && (
            <>
              <Button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full w-12 h-12 min-h-[44px] min-w-[44px] bg-white shadow border disabled:opacity-30"
                size="icon"
                aria-label="Show previous categories"
              >
                <ChevronLeft className="w-6 h-6 text-[#1A73E8]" aria-hidden />
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full w-12 h-12 min-h-[44px] min-w-[44px] bg-white shadow border disabled:opacity-30"
                size="icon"
                aria-label="Show next categories"
              >
                <ChevronRight className="w-6 h-6 text-[#1A73E8]" aria-hidden />
              </Button>
            </>
          )}

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-label="Top certification categories carousel"
          >
            {categories.map((category, index) => (
              <div
                key={category.id || category.slug || index}
                data-carousel-card
                className="flex-shrink-0 snap-start"
                style={{ width: cardWidthCalc }}
              >
                <CategoryCard category={category} imageFit="contain" />
              </div>
            ))}
          </div>

          {categories.length > itemsPerView && (
            <div
              className="flex justify-center gap-2 mt-8"
              aria-label="Top categories carousel slides"
            >
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => scrollToIndex(idx)}
                  aria-label={`Go to categories slide ${idx + 1} of ${maxIndex + 1}`}
                  aria-current={idx === currentIndex ? "true" : "false"}
                  className="min-h-[44px] min-w-[11px] flex items-center justify-center px-1"
                >
                  <span
                    className={`block rounded-full transition-all ${
                      idx === currentIndex
                        ? "bg-[#1A73E8] h-2 w-8"
                        : "bg-gray-300 w-2 h-2"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
