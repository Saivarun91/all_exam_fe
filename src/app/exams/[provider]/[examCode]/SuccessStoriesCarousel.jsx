"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, CheckCircle2, Quote, Star } from "lucide-react";
import { useCarouselItemsPerView } from "@/hooks/useCarouselItemsPerView";

const GAP_PX = 16;
const CARD_MIN_HEIGHT = 220;

const STORY_ACCENTS = [
  {
    bar: "from-[#1A73E8] to-[#3b82f6]",
    quote: "text-[#1A73E8]/25",
    avatar: "from-[#1A73E8] to-[#3b82f6]",
  },
  {
    bar: "from-violet-600 to-indigo-500",
    quote: "text-violet-500/25",
    avatar: "from-violet-600 to-indigo-500",
  },
  {
    bar: "from-emerald-600 to-teal-500",
    quote: "text-emerald-500/25",
    avatar: "from-emerald-600 to-teal-500",
  },
  {
    bar: "from-amber-500 to-orange-500",
    quote: "text-amber-500/30",
    avatar: "from-amber-500 to-orange-500",
  },
  {
    bar: "from-rose-500 to-pink-500",
    quote: "text-rose-400/25",
    avatar: "from-rose-500 to-pink-500",
  },
  {
    bar: "from-cyan-600 to-sky-500",
    quote: "text-cyan-500/25",
    avatar: "from-cyan-600 to-sky-500",
  },
];

function isInteractiveCarouselTarget(target) {
  if (!target || typeof target.closest !== "function") return false;
  return Boolean(
    target.closest('a, button, input, textarea, select, [role="button"]')
  );
}

function getInitials(name = "") {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";
}

function SuccessStoryCard({ testimonial, index = 0 }) {
  const rating = testimonial.rating || 5;
  const accent = STORY_ACCENTS[index % STORY_ACCENTS.length];

  return (
    <article className="relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-xl border border-[#DDE7FF] bg-white shadow-sm transition-shadow hover:shadow-md">
      <span
        className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${accent.bar}`}
        aria-hidden
      />
      <div className="flex flex-1 flex-col p-4 pl-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-200"
                }`}
              />
            ))}
          </div>
          <Quote className={`h-5 w-5 shrink-0 ${accent.quote}`} aria-hidden />
        </div>

        <p className="mb-4 line-clamp-4 flex-1 text-sm leading-relaxed text-[#0C1A35]/85 italic">
          &ldquo;{testimonial.review || testimonial.comment}&rdquo;
        </p>

        <div className="mt-auto flex items-center gap-3 border-t border-[#EEF3FF] pt-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${accent.avatar} text-sm font-bold text-white`}
          >
            {getInitials(testimonial.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#0C1A35]">
              {testimonial.name}
            </p>
            <p className="truncate text-xs text-[#0C1A35]/55">
              {testimonial.role || testimonial.title}
            </p>
          </div>
          {testimonial.verified ? (
            <Badge className="shrink-0 border-0 bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0">
              <CheckCircle2 className="mr-0.5 h-3 w-3" /> Verified
            </Badge>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function SuccessStoriesCarousel({ testimonials = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const itemsPerView = useCarouselItemsPerView(2);
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  const maxIndex = Math.max(0, testimonials.length - itemsPerView);
  const needsCarousel = testimonials.length > itemsPerView;

  const cardWidth =
    containerWidth > 0
      ? (containerWidth - (itemsPerView - 1) * GAP_PX) / itemsPerView
      : 0;

  const getStepWidth = useCallback(() => {
    if (cardWidth > 0) return cardWidth + GAP_PX;
    const el = scrollRef.current;
    if (!el) return 0;
    const card = el.querySelector("[data-carousel-card]");
    if (!card) return 0;
    return card.getBoundingClientRect().width + GAP_PX;
  }, [cardWidth]);

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

  const snapToNearest = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const step = getStepWidth();
    if (step <= 0) return;
    const idx = Math.round(el.scrollLeft / step);
    scrollToIndex(idx, "smooth");
  }, [getStepWidth, scrollToIndex]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => setContainerWidth(el.clientWidth);
    updateWidth();

    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !needsCarousel) return;

    let scrollEndTimer;
    const onScroll = () => {
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        if (dragRef.current.active) return;
        const step = getStepWidth();
        if (step <= 0) return;
        const idx = Math.round(el.scrollLeft / step);
        setCurrentIndex(Math.max(0, Math.min(maxIndex, idx)));
      }, 80);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(scrollEndTimer);
      el.removeEventListener("scroll", onScroll);
    };
  }, [getStepWidth, maxIndex, needsCarousel]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ left: 0, behavior: "auto" });
    setCurrentIndex(0);
  }, [itemsPerView, testimonials.length]);

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
    if (Math.abs(dx) > 6) dragRef.current.moved = true;
    if (dragRef.current.moved) {
      e.preventDefault();
      el.scrollLeft = dragRef.current.scrollLeft - dx;
    }
  };

  const finishDrag = () => {
    const el = scrollRef.current;
    if (!dragRef.current.active) return;
    const wasDrag = dragRef.current.moved;
    dragRef.current.active = false;
    dragRef.current.moved = false;
    if (wasDrag && el) {
      snapToNearest();
    }
  };

  const onPointerUp = (e) => {
    const el = scrollRef.current;
    try {
      el?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    finishDrag();
  };

  if (testimonials.length === 0) return null;

  if (!needsCarousel) {
    return (
      <div
        ref={containerRef}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {testimonials.map((testimonial, idx) => (
          <SuccessStoryCard key={idx} testimonial={testimonial} index={idx} />
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        onClick={() => scrollToIndex(currentIndex - 1)}
        disabled={currentIndex === 0}
        className="absolute -left-1 top-1/2 z-10 hidden h-9 w-9 min-h-[36px] min-w-[36px] -translate-y-1/2 rounded-full border bg-white shadow-sm disabled:opacity-30 sm:flex"
        size="icon"
        aria-label="Show previous success stories"
      >
        <ChevronLeft className="h-5 w-5 text-[#1A73E8]" aria-hidden />
      </Button>

      <Button
        type="button"
        onClick={() => scrollToIndex(currentIndex + 1)}
        disabled={currentIndex >= maxIndex}
        className="absolute -right-1 top-1/2 z-10 hidden h-9 w-9 min-h-[36px] min-w-[36px] -translate-y-1/2 rounded-full border bg-white shadow-sm disabled:opacity-30 sm:flex"
        size="icon"
        aria-label="Show next success stories"
      >
        <ChevronRight className="h-5 w-5 text-[#1A73E8]" aria-hidden />
      </Button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth px-0 sm:px-1 cursor-grab active:cursor-grabbing touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ minHeight: CARD_MIN_HEIGHT }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label="Student success stories carousel"
      >
        {testimonials.map((testimonial, idx) => (
          <div
            key={idx}
            data-carousel-card
            className="flex-shrink-0"
            style={{
              width: cardWidth > 0 ? `${cardWidth}px` : undefined,
              minHeight: CARD_MIN_HEIGHT,
            }}
          >
            <SuccessStoryCard testimonial={testimonial} index={idx} />
          </div>
        ))}
      </div>

      <div
        className="mt-4 flex justify-center gap-2"
        aria-label="Success stories carousel slides"
      >
        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
          <button
            type="button"
            key={idx}
            onClick={() => scrollToIndex(idx)}
            aria-label={`Go to success stories slide ${idx + 1} of ${maxIndex + 1}`}
            aria-current={idx === currentIndex ? "true" : "false"}
            className="flex min-h-[36px] min-w-[11px] cursor-pointer items-center justify-center px-1"
          >
            <span
              className={`block rounded-full transition-all ${
                idx === currentIndex
                  ? "h-2 w-7 bg-[#1A73E8]"
                  : "h-2 w-2 bg-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
