"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import Spinner from "@/app/_components/Spinner";

const GlobalUIContext = createContext(null);

export function GlobalUIProvider({ children }) {
  const [spinner, setSpinner] = useState({ open: false, label: "" });

  const toggleSpinner = useCallback((open, label = "") => {
    setSpinner({ open: Boolean(open), label: label || "" });
  }, []);

  const value = useMemo(() => ({ toggleSpinner }), [toggleSpinner]);

  return (
    <GlobalUIContext.Provider value={value}>
      {children}
      <Spinner
        open={spinner.open}
        label={spinner.label}
      />
    </GlobalUIContext.Provider>
  );
}

export function useGlobalUI() {
  const ctx = useContext(GlobalUIContext);
  if (!ctx) {
    throw new Error("useGlobalUI must be used within GlobalUIProvider");
  }
  return ctx;
}
