"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import Trans from "@/components/i18n/Trans";
import { REACT_I18N_ATTR } from "@/lib/domI18nUtils";

export default function BlogSectionClient({ articles, sectionSettings }) {
  const { lt } = useLanguage();

  return (
    <div className="container mx-auto px-4">
      <h2
        className="text-3xl md:text-4xl font-bold text-center mb-3 text-[#0C1A35]"
        {...{ [REACT_I18N_ATTR]: "" }}
      >
        {lt(
          "cms.blog.heading",
          sectionSettings.heading || "Latest Blog Posts"
        )}
      </h2>

      {sectionSettings.subtitle && (
        <p
          className="text-center text-[#0C1A35]/70 mb-12"
          {...{ [REACT_I18N_ATTR]: "" }}
        >
          {lt("cms.blog.subtitle", sectionSettings.subtitle)}
        </p>
      )}

      <div className="flex gap-8 overflow-x-auto pb-3">
        {articles.map((article) => {
          const blogUrl = article.slug ? `/blog/${article.slug}` : "#";

          const imgSrc = article.image_url
            ? getOptimizedImageUrl(article.image_url, 600, 340)
            : "https://via.placeholder.com/600x340";

          return (
            <Link
              key={article.id}
              href={blogUrl}
              className="min-w-[360px] max-w-[360px] flex-shrink-0"
              aria-label={
                article.title
                  ? `${article.title} — read full article`
                  : "Read full blog article"
              }
            >
              <Card className="overflow-hidden bg-white border-[#DDE7FF] hover:shadow-xl hover:-translate-y-1 transition duration-300 h-full flex flex-col">
                <div className="relative w-full h-[220px] bg-gray-100">
                  <img
                    src={imgSrc}
                    alt={article.title}
                    className="w-full h-full object-cover transition duration-500 hover:scale-105"
                    loading="lazy"
                  />

                  {article.category && (
                    <span className="absolute top-3 left-3 bg-[#1A73E8] text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {article.category}
                    </span>
                  )}
                </div>

                <CardContent className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-[#0C1A35] mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-[#0C1A35]/70 text-sm flex-1 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center text-[#1A73E8] font-semibold pt-4">
                    <Trans i18nKey="home.blog.read_more" />
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
