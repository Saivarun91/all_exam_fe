"use client";

import { useEffect, useState } from "react";
import OptimizedImage from "@/components/common/OptimizedImage";

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

export default function HeroSocialProof() {
  const animatedPercent = useAnimatedPercent();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-3xl mx-auto pt-2">
      <div className="flex -space-x-2 shrink-0">
        {SOCIAL_PROOF_AVATARS.map((src, i) => (
          <div
            key={i}
            className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white/90 shadow-sm ring-2 ring-[#1A73E8]/30"
          >
            <OptimizedImage
              src={src}
              alt="Professional student"
              width={36}
              height={36}
              className="rounded-full"
              objectFit="cover"
              sizes="36px"
            />
          </div>
        ))}
      </div>
      <p className="text-sm sm:text-base leading-snug text-center sm:text-left text-[#E7ECF6]">
        <span className="font-bold text-white tabular-nums inline-block min-w-[2.75rem] text-center">
          {animatedPercent}%
        </span>{" "}
        <span className="font-medium">
          found the questions similar to the certification test
        </span>
      </p>
    </div>
  );
}
