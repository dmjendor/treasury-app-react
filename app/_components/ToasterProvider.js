/**
 * ToasterProvider
 */
"use client";

import { Toaster } from "react-hot-toast";

/**
 *
 * - Render the global toast container.
 * - @returns {JSX.Element}
 */
export default function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className:
          "rounded-xl border border-border bg-card text-fg text-sm shadow-lg",
        duration: 5000,
      }}
    />
  );
}
