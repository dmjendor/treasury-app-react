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
  {
    label,
    hint,
    error,
    className = "",
    id,
    type = "text",
    labelRight,
    children,
    ...props
  },
  ref
) {
  const fieldId = id || props.name;

  const fieldProps = Object.fromEntries(
    Object.entries(props).filter(
      ([key]) => key.startsWith("data-") || key.startsWith("aria-")
    )
  );

  return (
    <FormField
      id={fieldId}
      label={label}
      hint={hint}
      labelRight={labelRight}
      error={error}
      type={type}
      {...fieldProps}
    >
      {children ? <div className="mb-2">{children}</div> : null}
      <input
        ref={ref}
        id={fieldId}
        name={fieldId}
        type={type}
        className={`w-full rounded-xl border border-border
          bg-input text-input-fg placeholder:text-muted-fg
          px-4 py-3
          focus:outline-none focus:ring-2 focus:ring-accent
          ${className}`}
        {...props}
      />
    </FormField>
  );
});

export default InputComponent;
