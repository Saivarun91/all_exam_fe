"use client";

import dynamic from "next/dynamic";

const BlogInlineContentSlider = dynamic(
  () => import("./BlogInlineContentSlider"),
  {
    ssr: false,
    loading: () => (
      <div className="my-8 h-48 animate-pulse rounded-lg bg-gray-100" aria-hidden />
    ),
  }
);

export default function BlogInlineContentSliderLazy(props) {
  return <BlogInlineContentSlider {...props} />;
}
