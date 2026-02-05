"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const VaultContext = createContext(undefined);

function VaultProvider({ children, vault }) {
  const [currentVault, setCurrentVault] = useState(vault ?? null);
  const [holdingsVersion, setHoldingsVersion] = useState(0);

  function updateVault(next) {
    setCurrentVault(next ?? null);
  }

  function invalidateHoldings() {
    setHoldingsVersion((prev) => prev + 1);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("vault:holdings:invalidate", {
          detail: { vaultId: currentVault?.id },
        }),
      );
    }
  }

  useEffect(() => {
    function handleInvalidate(event) {
      const targetId = event?.detail?.vaultId;
      if (!targetId || !currentVault?.id) return;
      if (String(targetId) !== String(currentVault.id)) return;
      setHoldingsVersion((prev) => prev + 1);
    }

    if (typeof window === "undefined") return;
    window.addEventListener("vault:holdings:invalidate", handleInvalidate);
    return () => {
      window.removeEventListener("vault:holdings:invalidate", handleInvalidate);
    };
  }, [currentVault?.id]);

  const value = useMemo(
    () => ({
      vault: currentVault,
      setVault: setCurrentVault,
      updateVault,
      holdingsVersion,
      invalidateHoldings,
    }),
    [currentVault, holdingsVersion]
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

/**
 * Read the vault context when available.
 * @returns {{ vault: any, setVault: (next: any) => void, updateVault: (next: any) => void, holdingsVersion: number, invalidateHoldings: () => void } | null}
 */
function useOptionalVault() {
  const ctx = useContext(VaultContext);
  return ctx === undefined ? null : ctx;
}

export { VaultProvider, useOptionalVault, useVault };
