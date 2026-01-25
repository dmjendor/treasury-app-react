export function getButtonClasses({ variant = "primary", size = "md" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium " +
    "transition-colors select-none " +
    "focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-bg";

  const sizing =
    size === "sm"
      ? "px-3 py-2 text-sm"
      : size === "lg"
        ? "px-4 py-3 text-base"
        : "px-3 py-2 text-sm";

  let variantClasses = "";
  if (variant === "primary") {
    variantClasses =
      "bg-primary-700 text-primary-50 hover:bg-primary-300 hover:text-primary-800 border border-border";
  } else if (variant === "accent") {
    variantClasses =
      "bg-accent-700 text-accent-50 hover:bg-accent-300 hover:text-accent-800 border border-border";
  } else if (variant === "danger") {
    variantClasses =
      "bg-danger-700 text-danger-50 hover:bg-danger-300 hover:text-danger-800 border border-border";
  } else if (variant === "outline") {
    variantClasses =
      "bg-transparent text-primary-900 border border-border hover:bg-primary-200 hover:text-primary-800";
  } else {
    variantClasses =
      "bg-primary-700 text-primary-50 border border-border hover:bg-primary-200 hover:text-primary-800";
  }

  return `${base} ${sizing} ${variantClasses}`;
}
