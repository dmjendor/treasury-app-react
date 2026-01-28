// app/public/vaults/[vaultId]/PublicValueUnitProvider.js
"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

const PublicValueUnitContext = createContext(null);

/**
 * Provide the public value unit state.
 * @param {{ defaultUnit?: "common" | "base", children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function PublicValueUnitProvider({ defaultUnit = "common", children }) {
  const [valueUnit, setValueUnit] = useState(defaultUnit);
  const value = useMemo(
    () => ({ valueUnit, setValueUnit }),
    [valueUnit],
  );

  return (
    <PublicValueUnitContext.Provider value={value}>
      {children}
    </PublicValueUnitContext.Provider>
  );
}

/**
 * Read the public value unit state.
 * @returns {{ valueUnit: "common" | "base", setValueUnit: (next: "common" | "base") => void }}
 */
export function usePublicValueUnit() {
  const ctx = useContext(PublicValueUnitContext);
  if (!ctx) {
    throw new Error(
      "usePublicValueUnit must be used within PublicValueUnitProvider",
    );
  }
  return ctx;
}
