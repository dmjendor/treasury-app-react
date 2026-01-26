"use client";

import Link from "next/link";
import IconComponent from "@/app/_components/IconComponent";
import { getButtonClasses } from "@/app/utils/buttonStyles";

export function NavButton({
  href,
  icon,
  iconRight,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  children,
  ...props
}) {
  const baseClasses = `${getButtonClasses({
    variant,
    size,
    focus: "none",
  })} w-full justify-start disabled:opacity-50 disabled:pointer-events-none ${className}`;

  const content = (
    <>
      {icon ? <IconComponent icon={icon} /> : null}

      <span className="flex-1 truncate text-left">{children}</span>

      {iconRight ? (
        <IconComponent
          icon={iconRight}
          className="h-4 w-4"
          variant={variant}
        />
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-disabled={disabled || undefined}
        className={baseClasses}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={baseClasses}
      {...props}
    >
      {content}
    </button>
  );
}
