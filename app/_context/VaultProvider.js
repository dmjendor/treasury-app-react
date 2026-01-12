"use client";
import { createContext, useContext, useMemo, useState } from "react";

const VaultContext = createContext(undefined);

function VaultProvider({ children, vault }) {
  const [currentVault, setCurrentVault] = useState(vault ?? null);

  function updateVault(next) {
    setCurrentVault(next ?? null);
  }

  const value = useMemo(
    () => ({
      vault: currentVault,
      setVault: setCurrentVault,
      updateVault,
    }),
    [currentVault]
  );

  return (
    <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
  );
}

function useVault() {
  const ctx = useContext(VaultContext);
  if (ctx === undefined)
    throw new Error("VaultContext was used outside VaultProvider");
  return ctx;
}

export { VaultProvider, useVault };
