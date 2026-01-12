export function getButtonClasses({ variant = "primary", size = "md" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium " +
    "transition-colors select-none " +
    "focus:outline-none focus:ring-2 focus:ring-(--accent-500) focus:ring-offset-2 focus:ring-offset-(--bg)";

  const sizing =
    size === "sm"
      ? "px-3 py-2 text-sm"
      : size === "lg"
      ? "px-4 py-3 text-base"
      : "px-3 py-2 text-sm";

  let variantClasses = "";
  if (variant === "primary") {
    variantClasses =
      "bg-(--btn-primary-bg) text-(--btn-primary-fg) hover:bg-(--btn-primary-hover) border border-(--border)";
  } else if (variant === "accent") {
    variantClasses =
      "bg-(--btn-accent-bg) text-(--btn-accent-fg) hover:bg-(--btn-accent-hover) border border-(--border)";
  } else if (variant === "danger") {
    variantClasses =
      "bg-(--btn-danger-bg) text-(--btn-danger-fg) hover:bg-(--btn-danger-hover) border border-(--border)";
  } else if (variant === "outline") {
    variantClasses =
      "bg-transparent text-(--btn-outline-fg) border border-(--btn-outline-border) hover:bg-(--btn-outline-hover) hover:text-(--primary-50)";
  } else if (variant === "ghost") {
    variantClasses =
      "bg-transparent text-(--btn-ghost-fg) border border-transparent hover:bg-(--btn-ghost-hover) hover:text-(--primary-50)";
  } else {
    variantClasses =
      "bg-transparent text-(--btn-outline-fg) border border-(--btn-outline-border) hover:bg-(--btn-outline-hover) hover:text-(--primary-50)";
  }

  return `${base} ${sizing} ${variantClasses}`;
}
