"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Cloud,
  Code,
  Database,
  Folder,
  Shield,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getCategoryPagePath,
  getCategoryImageSrc,
} from "@/lib/categoryImage";
import OptimizedImage from "@/components/common/OptimizedImage";
import { t, tf } from "@/lib/uiStrings";

const ICON_MAP = {
  Cloud,
  Shield,
  Briefcase,
  Database,
  Code,
  TrendingUp,
};

function CategoryCardImage({ imageSrc, title, Icon, imageFit = "cover" }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageSrc) && !imageFailed;
  const fitWholeImage = imageFit === "contain";

  if (showImage) {
    return (
      <div
        className={`relative w-full aspect-[17/11] overflow-hidden border-b border-[#DDE7FF] bg-[#F7FAFF] ${
          fitWholeImage ? "flex items-center justify-center p-2" : ""
        }`}
      >
        <OptimizedImage
          src={imageSrc}
          alt={title || "Category"}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className={fitWholeImage ? "object-contain" : "object-cover"}
          objectFit={fitWholeImage ? "contain" : "cover"}
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <div className="w-12 h-12 rounded-lg bg-[#1A73E8]/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-[#1A73E8]" aria-hidden />
      </div>
    </div>
  );
}

export default function CategoryCard({
  category,
  showExamCount = false,
  imageFit = "cover",
}) {
  const Icon = ICON_MAP[category?.icon] || Folder;
  const imageSrc = getCategoryImageSrc(category);
  const displayName = category?.name || category?.title || t("common.category");
  const description = category?.description || "";
  const categoryHref = getCategoryPagePath(category);
  const examCount = category?.examCount ?? 0;

  return (
    <Card className="w-full h-full overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all border-[#DDE7FF] bg-white">
      <CardContent className="p-0 h-full flex flex-col">
        <Link
          href={categoryHref}
          prefetch
          className="group flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1A73E8]"
          aria-label={tf("common.view_category", { name: displayName })}
          draggable={false}
        >
          <CategoryCardImage
            imageSrc={imageSrc}
            title={displayName}
            Icon={Icon}
            imageFit={imageFit}
          />

          <div className="flex-1 p-4 pb-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold text-[#0C1A35] group-hover:text-[#1A73E8] transition-colors line-clamp-2">
                {displayName}
              </h3>
              {showExamCount ? (
                <span className="shrink-0 rounded-full bg-[#1A73E8]/10 px-2.5 py-1 text-xs font-semibold text-[#1A73E8]">
                  {examCount}{" "}
                  {examCount === 1
                    ? t("common.exam_singular")
                    : t("common.exam_plural")}
                </span>
              ) : null}
            </div>
            {description ? (
              <p className="text-sm text-[#0C1A35]/60 mt-1 line-clamp-2">
                {description}
              </p>
            ) : null}
          </div>
        </Link>

        <div className="px-4 pb-4 pt-0">
          <Button
            asChild
            className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0] h-10 min-h-[44px]"
          >
            <Link href={categoryHref} prefetch>
              {t("common.view")}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
