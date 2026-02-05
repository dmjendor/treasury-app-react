// app/_context/ValueUnitProvider.js
"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

const ValueUnitContext = createContext(null);

/**
 * Provide the  value unit state.
 * @param {{ defaultUnit?: "common" | "base", children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function ValueUnitProvider({ defaultUnit = "common", children }) {
  const [valueUnit, setValueUnit] = useState(defaultUnit);
  const value = useMemo(() => ({ valueUnit, setValueUnit }), [valueUnit]);

  return (
    <ValueUnitContext.Provider value={value}>
      {children}
    </ValueUnitContext.Provider>
  );
}

/**
 * Read the  value unit state.
 * @returns {{ valueUnit: "common" | "base", setValueUnit: (next: "common" | "base") => void }}
 */
export function useValueUnit() {
  const ctx = useContext(ValueUnitContext);
  if (!ctx) {
    throw new Error("useValueUnit must be used within ValueUnitProvider");
  }
  return ctx;
}
