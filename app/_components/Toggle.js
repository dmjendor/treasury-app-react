"use client";

/**
 *
 * - Render a compact toggle switch.
 * - @param {object} props
 * - @returns {JSX.Element}
 */
export default function Toggle({
  name,
  id,
  label,
  hint,
  checked,
  defaultChecked,
  disabled,
  className = "",
  onChange,
}) {
  const fieldId = id || name;
  const isControlled = typeof checked === "boolean";

  return (
    <label
      htmlFor={fieldId}
      className={`
        flex items-start justify-between gap-4
        ${className}
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span className="min-w-0">
        {label ? (
          <span className="block text-sm font-semibold">{label}</span>
        ) : null}
        {hint ? <span className="block text-xs">{hint}</span> : null}
        {!label && !hint ? <span className="block text-sm">Toggle</span> : null}
      </span>

      <span className="relative inline-flex items-center">
        <input
          id={fieldId}
          name={name}
          type="checkbox"
          checked={isControlled ? checked : undefined}
          defaultChecked={!isControlled ? defaultChecked : undefined}
          disabled={disabled}
          onChange={onChange}
          aria-label={label || "Toggle"}
          className="peer sr-only"
        />

        {/* Track */}
        <span
          className="
            h-5 w-9 rounded-full
            bg-accent-200
            border border-border
            transition-colors
            
            peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent
          "
        />

        {/* Thumb */}
        <span
          className="
            pointer-events-none absolute left-0.5
            h-4 w-4 rounded-full
            bg-accent-600
            transition-transform
            peer-checked:translate-x-4
          "
        />
      </span>
    </label>
  );
}
