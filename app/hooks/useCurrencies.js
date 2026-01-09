"use client";

import { useEffect, useState } from "react";

export function useCurrencies({ vaultId }) {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function reload() {
    if (!vaultId) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/vaults/${vaultId}/currencies`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Failed to load currencies (${res.status})`);
      const data = await res.json();
      setCurrencies(Array.isArray(data) ? data : data?.currencies ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load currencies.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaultId]);

  return { currencies, loading, busy, error, setError, reload, setBusy };
}
