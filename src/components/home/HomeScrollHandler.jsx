"use client";

import dynamic from "next/dynamic";

const ScrollHandler = dynamic(() => import("./ScrollHandler"), { ssr: false });

export default function HomeScrollHandler() {
  return <ScrollHandler />;
}
