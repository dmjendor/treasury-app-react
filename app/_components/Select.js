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
          border border-(--border)
          bg-(--input)
          px-4 py-3
          text-sm text-(--input-fg)
          focus:outline-none focus:ring-2 focus:ring-(--accent-500)
          focus:ring-offset-2 focus:ring-offset-(--bg)
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-colors
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
