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
  if (variant === "muted") return "text-muted-fg opacity-80";
  if (variant === "accent") return "text-accent-400 opacity-90";
  if (variant === "primary") return "text-primary-400 opacity-90";
  if (variant === "danger") return "text-danger-400 opacity-90";
  if (variant === "inherit") return "";
  return "opacity-80";
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
  variant = "muted",
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
        className={cx(text, variantClass, className)}
        title={!decorative ? title : undefined}
        {...a11yProps}
      />
    );
  }

  if (isReactIcon(icon)) {
    const ReactIcon = icon;
    return (
      <ReactIcon
        className={cx(hw, variantClass, className)}
        title={!decorative ? title : undefined}
        {...a11yProps}
      />
    );
  }

  return null;
}

export default IconComponent;
