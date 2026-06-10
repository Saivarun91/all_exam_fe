"use client";

import AutoText from "@/components/i18n/AutoText";

export default function TranslatedAddress({
  address = "",
  className = "",
  as: Component = "span",
}) {
  const text = (address || "").trim();
  if (!text) return null;

  return (
    <AutoText
      text={text}
      as={Component}
      className={className}
    />
  );
}
