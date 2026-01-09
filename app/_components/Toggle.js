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
          className="text-sm font-semibold text-ink-900"
          htmlFor={fieldId}
        >
          {label}
        </label>
      ) : null}

      {hint ? <div className="text-xs text-ink-600">{hint}</div> : null}

      <label
        htmlFor={fieldId}
        className={`
          flex items-center justify-between gap-4
          rounded-xl
          border border-white/10
          bg-white/5
          px-4 py-3
          ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span className="text-sm text-ink-800">{label ? null : "Toggle"}</span>

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
              bg-white/10
              border border-white/10
              transition-colors
              peer-checked:bg-primary-500
              peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500/50
            "
          />

          {/* Thumb */}
          <span
            className="
              pointer-events-none absolute left-0.5
              h-5 w-5 rounded-full
              bg-white
              transition-transform
              peer-checked:translate-x-5
            "
          />
        </span>
      </label>
    </div>
  );
}
