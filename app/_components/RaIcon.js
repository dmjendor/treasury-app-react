export default function RaIcon({ name = "", className = "", title }) {
  if (typeof name !== "string") return null;
  const hasRaPrefix = name?.includes("ra ");
  const classNames = hasRaPrefix ? name : `ra ${name}`;

  return (
    <i
      className={`${classNames} ${className}`}
      aria-hidden={!title}
      aria-label={title}
      role={title ? "img" : undefined}
    />
  );
}
