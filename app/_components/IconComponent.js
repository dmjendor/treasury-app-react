import ImgIcon from "@/app/_components/ImgIcon";
import RaIcon from "@/app/_components/RaIcon";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

const iconSizeMap = {
  xs: { hw: "h-3 w-3", text: "text-sm" },
  sm: { hw: "h-4 w-4", text: "text-base" },
  md: { hw: "h-5 w-5", text: "text-lg" },
  lg: { hw: "h-6 w-6", text: "text-xl" },
  xl: { hw: "h-7 w-7", text: "text-2xl" },
  "2xl": { hw: "h-8 w-8", text: "text-3xl" },
};

function sizeToClasses(size) {
  if (typeof size === "number") {
    return {
      hw: `h-[${size}px] w-[${size}px]`,
      text: `text-[${size}px]`,
    };
  }

  return iconSizeMap[size] || iconSizeMap.md;
}

function variantToClass(variant) {
  if (variant === "muted") return "text-muted-fg";
  if (variant === "accent") return "text-accent-200";
  if (variant === "accent-dark") return "text-accent-800";
  if (variant === "primary") return "text-primary-200";
  if (variant === "primary-dark") return "text-primary-800";
  if (variant === "danger") return "text-danger-200";
  if (variant === "danger-dark") return "text-danger-800";
  if (variant === "inherit") return "";
  return "text-fg";
}

function isSvgPath(icon) {
  return (
    typeof icon === "string" && icon.startsWith("/") && icon.endsWith(".svg")
  );
}

function isRAIcon(icon) {
  return typeof icon === "string" && icon.startsWith("ra-");
}

function isReactIcon(icon) {
  return typeof icon === "function";
}

/**
 * IconComponent
 *
 * Props:
 * - size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | number(px)
 * - variant: "muted" | "accent" | "primary" | "danger" | "inherit"
 * - className: appended class names (wins if it includes its own sizing)
 * - title: accessible label when not decorative
 * - decorative: boolean (default true)
 */
function IconComponent({
  icon,
  size = "md",
  variant = "primary",
  className = "",
  title,
  decorative = true,
}) {
  const { hw, text } = sizeToClasses(size);
  const variantClass = variantToClass(variant);

  const a11yProps = decorative
    ? { "aria-hidden": true }
    : { role: "img", "aria-label": title || "Icon" };

  if (isSvgPath(icon)) {
    return (
      <ImgIcon
        src={icon}
        className={cx(hw, variantClass, className)}
        alt={!decorative ? title || "Icon" : ""}
        {...a11yProps}
      />
    );
  }

  if (isRAIcon(icon)) {
    return (
      <RaIcon
        name={icon}
        className={cx(text, className, variantClass)}
        title={!decorative ? title : undefined}
        {...a11yProps}
      />
    );
  }

  if (isReactIcon(icon)) {
    const ReactIcon = icon;
    return (
      <ReactIcon
        className={cx(hw, className, variantClass)}
        title={!decorative ? title : undefined}
        {...a11yProps}
      />
    );
  }

  return null;
}

export default IconComponent;
