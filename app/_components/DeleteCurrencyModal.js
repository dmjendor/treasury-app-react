"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeCode } from "@/app/utils/currencyUtils";
import { Button } from "@/app/_components/Button";

export default function DeleteCurrencyModal({ vaultId, currencyId }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `/api/vaults/${vaultId}/currencies/${currencyId}`,
          { cache: "no-store" }
        );
        if (!res.ok)
          throw new Error(`Failed to load currency (${res.status}).`);
        const { data } = await res.json();
        console.log(data);
        if (!cancelled) setCurrency(data);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load currency.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (vaultId && currencyId) load();

    return () => {
      cancelled = true;
    };
  }, [vaultId, currencyId]);

  function close() {
    router.back();
  }

  async function confirmDelete() {
    setError("");
    setBusy(true);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("vault:refresh", { detail: { vaultId } })
      );
    }

    try {
      if (Number(currency?.multiplier) === 1) {
        throw new Error(
          "You can’t delete the base currency. Set another currency as base first."
        );
      }

      const res = await fetch(
        `/api/vaults/${vaultId}/currencies/${currencyId}`,
        { method: "DELETE" }
      );
      if (!res.ok)
        throw new Error(`Failed to delete currency (${res.status}).`);

      router.refresh();
      router.back();
    } catch (e) {
      setError(e?.message || "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-overlay"
        onClick={() => (busy ? null : close())}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card text-card-fg shadow-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Delete currency</h2>
            <p className="text-sm text-muted-fg">This can’t be undone.</p>
          </div>
          <Button
            variant="accent"
            className="px-2 py-1 rounded-lg border border-border hover:bg-surface disabled:opacity-50"
            onClick={close}
            disabled={busy}
          >
            ✕
          </Button>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-muted-fg">Loading…</div>
        ) : null}

        {error ? (
          <div className="mt-4 p-3 rounded-lg border border-danger-600 bg-danger-100 text-sm text-danger-700">
            {error}
          </div>
        ) : null}

        <div className="mt-4 text-sm">
          Delete{" "}
          <span className="font-medium">
            {currency?.name} ({normalizeCode(currency?.code)})
          </span>
          ?
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="primary"
            onClick={close}
            className="px-3 py-2 rounded-lg border border-border bg-btn-secondary-bg text-btn-secondary-fg hover:bg-btn-secondary-hover-bg disabled:opacity-50"
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            className="px-3 py-2 rounded-lg bg-btn-primary-bg text-btn-primary-fg hover:bg-btn-primary-hover-bg disabled:opacity-50"
            disabled={busy}
          >
            {busy ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
