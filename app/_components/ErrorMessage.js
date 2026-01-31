"use client";

function ErrorMessage({ error }) {
  const message =
    typeof error === "string"
      ? error
      : typeof error?.error === "string"
        ? error.error
        : "";
  return (
    <>
      {message ? (
        <div className="rounded-xl border border-danger-600 bg-danger-300 p-3 text-sm text-danger-700">
          {message}
        </div>
      ) : null}
    </>
  );
}

export default ErrorMessage;
