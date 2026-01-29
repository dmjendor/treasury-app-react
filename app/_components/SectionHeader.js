export function SectionHeader({ title, action, className = "" }) {
  return (
    <div
      className={["flex items-center justify-between", "mb-3", className].join(
        " ",
      )}
    >
      <h3 className="text-base font-medium">{title}</h3>

      {action ? <div>{action}</div> : null}
    </div>
  );
}
