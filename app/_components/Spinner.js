function Spinner({ open = false, label = "" }) {
  if (!open) return null;

  return (
    <div className="spinner-overlay" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      {label ? <div className="spinner-label">{label}</div> : null}
    </div>
  );
}

export default Spinner;
