"use client";

/**
 * FormField
 *
 * Shared wrapper for form controls:
 * - label
 * - hint text
 * - error text
 *
 * Use this to keep consistent spacing and typography across all form inputs.
 */
export default function FormField({ id, label, hint, error, children }) {
  return (
    <div className="space-y-1">
      {label ? (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-ink-900"
        >
          {label}
        </label>
      ) : null}

      {hint ? <div className="text-xs text-ink-600">{hint}</div> : null}

      {children}

      {error ? <div className="text-xs text-danger">{error}</div> : null}
    </div>
  );
}
