"use client";

function resolveText({ text, name, course, provider, category }) {
  return (
    text ||
    name ||
    course?.title ||
    course?.name ||
    provider?.name ||
    category?.title ||
    category?.name ||
    ""
  ).trim();
}

export function CourseTitleText({ course, name, className = "", ...props }) {
  const label = resolveText({ course, name });
  if (!label) return null;
  return (
    <span className={className} {...props}>
      {label}
    </span>
  );
}

export function ProviderNameText({ provider, name, className = "", ...props }) {
  const label = resolveText({ provider, name });
  if (!label) return null;
  return (
    <span className={className} {...props}>
      {label}
    </span>
  );
}

export function CategoryTitleText({ category, name, className = "", ...props }) {
  const label = resolveText({ category, name });
  if (!label) return null;
  return (
    <span className={className} {...props}>
      {label}
    </span>
  );
}

export default function EntityText({
  text = "",
  name,
  course,
  provider,
  category,
  as: Component = "span",
  className = "",
  ...props
}) {
  const label = resolveText({ text, name, course, provider, category });
  if (!label) return null;

  return (
    <Component className={className} {...props}>
      {label}
    </Component>
  );
}
