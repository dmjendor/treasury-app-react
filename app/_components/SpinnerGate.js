/**
 * Spinner Gate
 * Client helper to toggle the global spinner while mounted.
 */

"use client";

import { useEffect } from "react";
import { useGlobalUI } from "@/app/_context/GlobalUIProvider";

/**
 * Toggle the global spinner while mounted.
 * @param {{ open?: boolean, label?: string }} props
 * @returns {JSX.Element|null}
 */
export default function SpinnerGate({ open = true, label = "" }) {
  const { toggleSpinner } = useGlobalUI();

  useEffect(() => {
    if (!open) {
      toggleSpinner(false);
      return;
    }

    toggleSpinner(true, label);
    return () => toggleSpinner(false);
  }, [open, label, toggleSpinner]);

  return null;
}
