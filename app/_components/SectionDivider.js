export function SectionDivider({ className = "" }) {
  return (
    <div className={["my-4 border-t border-border", className].join(" ")} />
  );
}
