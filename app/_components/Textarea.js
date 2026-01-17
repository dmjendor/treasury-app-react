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
          border border-border bg-input
          px-4 py-3
          text-sm text-input-fg
          placeholder:text-muted-fg
          focus:outline-none focus:ring-2 focus:ring-accent
          disabled:opacity-60 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
    </FormField>
  );
});

export default Textarea;
