export default function SubCard({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-lg border px-4 py-3",
        "bg-subcard text-subcard-fg border-subcard-border",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
