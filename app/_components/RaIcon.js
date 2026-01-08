export default function RaIcon({ name = "", className = "", label }) {
  if (typeof name !== "string") return null;
  const hasRaPrefix = name?.includes("ra ");
  const classNames = hasRaPrefix ? name : `ra ${name}`;

  return (
    <i
      className={`${classNames} ${className}`}
      aria-hidden={!label}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
}
