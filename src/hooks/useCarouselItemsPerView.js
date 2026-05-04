"use client";

import { useState, useEffect } from "react";

/**
 * Home carousel density from CSS breakpoints via matchMedia — avoids reading
 * window.innerWidth on every resize (common forced-reflow source when many
 * carousels mount together).
 *
 * @param {number} desktopCount — items visible at ≥1024px (default 3; testimonials use 4)
 */
export function useCarouselItemsPerView(desktopCount = 3) {
  const [itemsPerView, setItemsPerView] = useState(desktopCount);

  useEffect(() => {
    const mqSm = window.matchMedia("(max-width: 767px)");
    const mqMd = window.matchMedia(
      "(min-width: 768px) and (max-width: 1023px)"
    );

    const update = () => {
      let next = desktopCount;
      if (mqSm.matches) next = 1;
      else if (mqMd.matches) next = 2;
      setItemsPerView((prev) => (prev === next ? prev : next));
    };

    mqSm.addEventListener("change", update);
    mqMd.addEventListener("change", update);
    update();

    return () => {
      mqSm.removeEventListener("change", update);
      mqMd.removeEventListener("change", update);
    };
  }, [desktopCount]);

  return itemsPerView;
}
