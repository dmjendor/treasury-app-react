"use client";

/**
 * FormField
 *
 * Shared wrapper for form controls:
 * - label
 * - hint text
 * - error text
 *
 * Layout inferred from `type`:
 * - checkbox/radio => inline (control + label on same row)
 * - everything else => stacked
 *
 * Extra props are passed to the outer wrapper <div>.
 */
export default function FormField({
  id,
  label,
  labelRight,
  hint,
  error,
  type,
  children,
  className = "",
  ...rest
}) {
  const isChoice = type === "checkbox" || type === "radio";

  if (isChoice) {
    return (
      <div
        className={`space-y-1 ${className}`}
        {...rest}
      >
        <label
          htmlFor={id}
          className="
            grid grid-cols-[auto_1fr] items-center gap-3 rounded-xl
            border border-border bg-input text-input-fg

            px-4 py-3

            transition-colors
          "
        >
          <span className="flex items-center">{children}</span>

          {label ? (
            <span className="min-w-0 text-left text-sm">{label}</span>
          ) : null}
        </label>

        {hint ? <div className="text-xs">{hint}</div> : null}
        {error ? <div className="text-xs text-danger-600">{error}</div> : null}
      </div>
    );
  }

  return (
    <div
      className={`space-y-1 ${className}`}
      {...rest}
    >
      {label ? (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <label
            htmlFor={id}
            className="text-sm font-semibold text-fg"
          >
            {label}
          </label>

          {labelRight ? <div className="shrink-0">{labelRight}</div> : null}
        </div>
      ) : null}

      {hint ? <div className="text-xs text-muted-fg">{hint}</div> : null}

      {children}

      {error ? <div className="text-xs text-danger-600">{error}</div> : null}
    </div>
  );
}
