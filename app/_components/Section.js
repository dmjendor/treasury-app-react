export default function Section({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-2xl border p-5 space-y-4",
        "bg-section text-section-fg border-section-border",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
