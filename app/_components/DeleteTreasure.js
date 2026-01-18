"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/app/_components/Button";

export default function DeleteTreasure({ vaultId, treasureId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [treasure, setTreasure] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `/api/vaults/${vaultId}/treasures/${treasureId}`,
          { cache: "no-store" },
        );

        if (!res.ok) {
          throw new Error(`Failed to load treasure (${res.status}).`);
        }

        const { data } = await res.json();
        if (!cancelled) setTreasure(data);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load treasure.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (vaultId && treasureId) load();

    return () => {
      cancelled = true;
    };
  }, [vaultId, treasureId]);

  function handleClose() {
    if (busy) return;
    if (onClose) onClose();
  }

  async function confirmDelete() {
    setError("");
    setBusy(true);

    try {
      const res = await fetch(
        `/api/vaults/${vaultId}/treasures/${treasureId}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        throw new Error(`Failed to delete treasure (${res.status}).`);
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
        <h2 className="text-lg font-semibold text-fg">Delete treasure</h2>
        <p className="text-sm text-muted-fg">This can’t be undone.</p>
      </div>

      {loading ? <div className="text-sm text-muted-fg">Loading…</div> : null}

      {error ? (
        <div className="rounded-xl border border-danger-600 bg-danger-100 p-3 text-sm text-danger-700">
          {error}
        </div>
      ) : null}

      <div className="text-sm text-fg">
        Delete{" "}
        <span className="font-semibold">
          {treasure?.name ?? "this treasure"}
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
