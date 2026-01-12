"use client";

import { forwardRef } from "react";
import FormField from "@/app/_components/FormField";

/**
 * Input
 *
 * Styled <input> with optional label/hint/error.
 * Intended to be the default text field used across the app.
 */
const InputComponent = forwardRef(function Input(
  { label, hint, error, className = "", id, type = "text", ...props },
  ref
) {
  const fieldId = id || props.name;

  return (
    <FormField
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      type={type}
      {...props}
    >
      <input
        ref={ref}
        id={fieldId}
        name={fieldId}
        type={type}
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

export default InputComponent;
