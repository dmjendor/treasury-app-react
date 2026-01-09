"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeCode } from "@/app/utils/currencyUtils";

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
        const data = await res.json();
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
        className="absolute inset-0 bg-black/40"
        onClick={() => (busy ? null : close())}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-(--color-border) bg-(--color-card) text-(--color-card-fg) shadow-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Delete currency</h2>
            <p className="text-sm text-muted-foreground">
              This can’t be undone.
            </p>
          </div>
          <button
            type="button"
            className="px-2 py-1 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
            onClick={close}
            disabled={busy}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-muted-foreground">Loading…</div>
        ) : null}

        {error ? (
          <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <div className="mt-4 text-sm">
          Delete{" "}
          <span className="font-medium">
            {currency?.name} ({normalizeCode(currency?.abbreviation)})
          </span>
          ?
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            className="px-3 py-2 rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-50"
            disabled={busy}
          >
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
