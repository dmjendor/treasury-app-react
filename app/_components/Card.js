export default function Card({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-lg border p-4",
        "bg-card text-card-fg border-border",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
