"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/app/_components/Button";

export function TimelockedButton({
  lockMs = 2500,
  fillColor = "var(--accent)",
  fillOpacity = 0.25,
  disabled = false,
  children,
  className = "",
  type = "button",
  variant = "accent",
  size = "md",
  onClick,
  ...props
}) {
  const [isLocked, setIsLocked] = useState(() => lockMs > 0);

  const isDisabled = disabled || isLocked;

  const fillStyle = useMemo(
    () => ({
      backgroundColor: fillColor,
      opacity: fillOpacity,
      transformOrigin: "left",
      animationName: "ptUnlockFill",
      animationDuration: `${lockMs}ms`,
      animationTimingFunction: "linear",
      animationFillMode: "forwards",
    }),
    [fillColor, fillOpacity, lockMs],
  );

  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      disabled={isDisabled}
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Inline keyframes so we don't depend on any Tailwind animation utilities */}
      <style>{`
        @keyframes ptUnlockFill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>

      {isLocked ? (
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={fillStyle}
          onAnimationEnd={() => setIsLocked(false)}
        />
      ) : null}

      <span className="relative">{children}</span>
    </Button>
  );
}
