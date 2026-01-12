"use client";

import { getButtonClasses } from "@/app/utils/buttonStyles";
import Link from "next/link";
import React from "react";

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  prefetch = true,
  ...props
}) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={`${getButtonClasses({ variant, size })} ${className}`}
      {...props}
    />
  );
}
