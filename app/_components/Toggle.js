"use client";

/**
 * Toggle
 *
 * Accessible boolean control styled as a switch.
 * Under the hood it's a checkbox, so it works naturally with forms and FormData.
 */
export default function Toggle({
  name,
  id,
  label,
  hint,
  defaultChecked,
  disabled,
  className = "",
}) {
  const fieldId = id || name;

  return (
    <div className={`space-y-1 ${className}`}>
      {label ? (
        <label
          className="text-sm font-semibold text-fg"
          htmlFor={fieldId}
        >
          {label}
        </label>
      ) : null}

      {hint ? <div className="text-xs text-muted-fg">{hint}</div> : null}

      <label
        htmlFor={fieldId}
        className={`
          flex items-center justify-between gap-4
          rounded-xl
          border border-border
          bg-input
          px-4 py-3
          ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span className="text-sm text-fg">{label ? null : "Toggle"}</span>

        <span className="relative inline-flex items-center">
          <input
            id={fieldId}
            name={name}
            type="checkbox"
            defaultChecked={defaultChecked}
            disabled={disabled}
            className="peer sr-only"
          />

          {/* Track */}
          <span
            className="
              h-6 w-11 rounded-full
              bg-surface
              border border-border
              transition-colors
              peer-checked:bg-btn-primary-bg
              peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent
            "
          />

          {/* Thumb */}
          <span
            className="
              pointer-events-none absolute left-0.5
              h-5 w-5 rounded-full
              bg-card
              transition-transform
              peer-checked:translate-x-5
            "
          />
        </span>
      </label>
    </div>
  );
}
