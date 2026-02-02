/**
 * Generic pill UI.
 */
/**
 * Render a pill.
 * @param {{ children: any, variant?: string, size?: string, className?: string }} props
 * @returns {JSX.Element}
 */
export default function Pill({
  children,
  variant = "outline",
  size = "sm",
  className = "",
  ...props
}) {
  return (
    <span
      className={`${getPillClasses({ variant, size })} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Build pill classes.
 * @param {{ variant?: string, size?: string }} options
 * @returns {string}
 */
function getPillClasses({ variant = "outline", size = "sm" }) {
  const base =
    "inline-flex items-center rounded-full border font-semibold " +
    "transition-colors whitespace-nowrap";

  const sizing =
    size === "md"
      ? "px-3 py-1.5 text-sm"
      : size === "lg"
        ? "px-4 py-2 text-sm"
        : "px-2.5 py-1 text-xs";

  let variantClasses = "";
  if (variant === "primary") {
    variantClasses = "bg-primary-700 text-primary-50 border-border";
  } else if (variant === "accent") {
    variantClasses = "bg-accent-700 text-accent-50 border-border";
  } else if (variant === "danger") {
    variantClasses = "bg-danger-700 text-danger-50 border-border";
  } else if (variant === "outline") {
    variantClasses = "bg-transparent text-fg border-border";
  } else if (variant === "ghost") {
    variantClasses = "bg-surface-200 text-fg border-border";
  } else {
    variantClasses = "bg-surface-200 text-fg border-border";
  }

  return `${base} ${sizing} ${variantClasses}`;
}
