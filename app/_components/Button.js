"use client";

import { getButtonClasses } from "@/app/utils/buttonStyles";
import React from "react";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${getButtonClasses({
        variant,
        size,
      })} disabled:opacity-50 cursor-pointer disabled:pointer-events-none ${className}`}
      {...props}
    />
  );
}
