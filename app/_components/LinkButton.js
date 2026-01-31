"use client";

import { getButtonClasses } from "@/app/utils/buttonStyles";
import IconComponent from "@/app/_components/IconComponent";
import Link from "next/link";
import React from "react";

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  prefetch = true,
  icon,
  iconLabel,
  iconSize,
  iconVariant,
  children,
  ...props
}) {
  const hasChildren = React.Children.count(children) > 0;
  const showIconOnly = Boolean(icon) && !hasChildren;
  const label = iconLabel || (typeof children === "string" ? children : "");
  const a11yProps = showIconOnly ? { "aria-label": label || "Action" } : {};

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={`${getButtonClasses({ variant, size })} ${className}`}
      {...a11yProps}
      {...props}
    >
      {showIconOnly ? (
        <IconComponent
          icon={icon}
          size={iconSize || size}
          title={label || "Action"}
          decorative={false}
        />
      ) : (
        children
      )}
    </Link>
  );
}
