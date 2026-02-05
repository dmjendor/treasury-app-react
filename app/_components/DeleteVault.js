// app/_components/DeleteVault.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/Button";
import ErrorMessage from "@/app/_components/ErrorMessage";
import InputComponent from "@/app/_components/InputComponent";
import { deleteVaultAction } from "@/app/_lib/actions/vaults";

/**
 * Render a delete vault confirmation panel.
 * @param {{ vaultId: string, onClose?: () => void, onDeleted?: () => void }} props
 * @returns {JSX.Element}
 */
export default function DeleteVault({ vaultId, onClose, onDeleted }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [vaultName, setVaultName] = useState("");
  const [confirmName, setConfirmName] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/vaults/${vaultId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to load vault (${res.status}).`);
        }

        const { data } = await res.json();
        if (!cancelled) {
          setVaultName(String(data?.name || ""));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Failed to load vault.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (vaultId) load();

    return () => {
      cancelled = true;
    };
  }, [vaultId]);

  const canDelete = useMemo(() => {
    if (!confirmChecked) return false;
    if (!vaultName) return false;
    return confirmName.trim() === vaultName.trim();
  }, [confirmChecked, confirmName, vaultName]);

  function handleClose() {
    if (busy) return;
    if (onClose) {
      onClose();
      return;
    }
    router.back();
  }

  async function confirmDelete() {
    if (busy) return;
    setError("");

    if (!canDelete) {
      setError("Type the vault name and confirm to delete.");
      return;
    }

    setBusy(true);

    const res = await deleteVaultAction({
      vaultId,
      confirmName: confirmName.trim(),
    });

    if (!res?.ok) {
      setError(res?.error || "Vault could not be deleted.");
      setBusy(false);
      return;
    }

    if (onDeleted) {
      onDeleted();
      return;
    }

    if (typeof window !== "undefined") {
      window.location.assign("/account/vaults");
      return;
    }

    router.replace("/account/vaults");
  }

  return (
    <div className="space-y-4 py-4 px-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-fg">
          This action permanently deletes the vault and all associated data.
        </p>
        <p className="text-sm text-muted-fg">
          You will not be able to recover it.
        </p>
      </div>

      {loading ? <div className="text-sm text-muted-fg">Loading...</div> : null}

      {error ? <ErrorMessage error={error} /> : null}

      <div className="space-y-3">
        <div className="text-sm text-fg">
          Type{" "}
          <span className="font-semibold">
            {vaultName || "the vault name"}
          </span>{" "}
          to confirm.
        </div>
        <InputComponent
          id="confirm-vault-name"
          label="Vault name"
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
        />
        <InputComponent
          id="confirm-vault-delete"
          type="checkbox"
          label="I understand this cannot be undone."
          checked={confirmChecked}
          onChange={(e) => setConfirmChecked(e.target.checked)}
        />
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
          disabled={busy || !canDelete}
        >
          {busy ? "Deleting..." : "Delete vault"}
        </Button>
      </div>
    </div>
  );
}
