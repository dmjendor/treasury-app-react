"use client";

import { forwardRef } from "react";
import FormField from "@/app/_components/FormField";

/**
 * Select
 *
 * Styled <select> with optional label/hint/error.
 * Expects children to be <option> elements.
 */
const Select = forwardRef(function Select(
  { label, hint, error, className = "", id, children, ...props },
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
      <select
        ref={ref}
        id={fieldId}
        className={`
          w-full
          rounded-xl
          border border-white/10
          bg-white/5
          px-4 py-3
          text-sm text-ink-900
          focus:outline-none focus:ring-2 focus:ring-primary-500/50
          disabled:opacity-60 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
    </FormField>
  );
});

export default Select;
