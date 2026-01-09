"use client";

import { forwardRef } from "react";
import FormField from "@/app/_components/FormField";

/**
 * Textarea
 *
 * Styled textarea with optional label/hint/error.
 * Intended to match the Input component's styling.
 */
const Textarea = forwardRef(function Textarea(
  { label, hint, error, className = "", id, rows = 4, ...props },
  ref
) {
  const fieldId = id || props.name;

  return (
    <FormField
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
    >
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        className={`
          w-full
          rounded-xl
          border border-white/10
          bg-white/5
          px-4 py-3
          text-sm text-ink-900
          placeholder:text-ink-600
          focus:outline-none focus:ring-2 focus:ring-primary-500/50
          disabled:opacity-60 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
    </FormField>
  );
});

export default Textarea;
