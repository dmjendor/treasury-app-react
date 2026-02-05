// app/_components/DeleteValuable.js
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/app/_components/Button";

/**
 * Render a delete valuable confirmation panel.
 * @param {{ vaultId: string, valuableId: string, onClose?: () => void }} props
 * @returns {JSX.Element}
 */
export default function DeleteValuable({ vaultId, valuableId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [valuable, setValuable] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `/api/vaults/${vaultId}/valuables/${valuableId}`,
          { cache: "no-store" },
        );

        if (!res.ok) {
          throw new Error(`Failed to load valuable (${res.status}).`);
        }

        const { data } = await res.json();
        if (!cancelled) setValuable(data);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load valuable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (vaultId && valuableId) load();

    return () => {
      cancelled = true;
    };
  }, [vaultId, valuableId]);

  function handleClose() {
    if (busy) return;
    if (onClose) onClose();
  }

  async function confirmDelete() {
    setError("");
    setBusy(true);

    try {
      const res = await fetch(
        `/api/vaults/${vaultId}/valuables/${valuableId}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        throw new Error(`Failed to delete valuable (${res.status}).`);
      }

      if (onClose) onClose();
    } catch (e) {
      setError(e?.message || "Delete failed.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 py-4 px-6">
      <div>
        <p className="text-sm text-muted-fg">This can&apos;t be undone.</p>
      </div>

      {loading ? <div className="text-sm text-muted-fg">Loading...</div> : null}

      {error ? (
        <div className="rounded-xl border border-danger-600 bg-danger-100 p-3 text-sm text-danger-700">
          {error}
        </div>
      ) : null}

      <div className="text-sm text-fg">
        Delete{" "}
        <span className="font-semibold">
          {valuable?.name ?? "this valuable"}
        </span>
        ?
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          onClick={handleClose}
          className="px-3 py-2 rounded-lg disabled:opacity-50"
          disabled={busy}
        >
          Cancel
        </Button>

        <Button
          variant="danger"
          onClick={confirmDelete}
          className="px-3 py-2 rounded-lg disabled:opacity-50"
          disabled={busy}
        >
          {busy ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}
