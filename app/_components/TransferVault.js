// app/_components/TransferVault.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/Button";
import ErrorMessage from "@/app/_components/ErrorMessage";
import InputComponent from "@/app/_components/InputComponent";
import Select from "@/app/_components/Select";
import {
  getVaultTransferCandidatesAction,
  transferVaultOwnershipAction,
} from "@/app/_lib/actions/vaults";

/**
 * Render a transfer vault confirmation panel.
 * @param {{ vaultId: string, onClose?: () => void, onTransferred?: () => void }} props
 * @returns {JSX.Element}
 */
export default function TransferVault({ vaultId, onClose, onTransferred }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [vaultName, setVaultName] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [newOwnerId, setNewOwnerId] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [vaultRes, membersRes] = await Promise.all([
          fetch(`/api/vaults/${vaultId}`, { cache: "no-store" }),
          getVaultTransferCandidatesAction({ vaultId }),
        ]);

        if (!vaultRes.ok) {
          throw new Error(`Failed to load vault (${vaultRes.status}).`);
        }

        const vaultBody = await vaultRes.json();
        if (!cancelled) {
          setVaultName(String(vaultBody?.data?.name || ""));
        }

        if (!membersRes?.ok) {
          throw new Error(membersRes?.error || "Failed to load members.");
        }

        const list = Array.isArray(membersRes?.data) ? membersRes.data : [];
        if (!cancelled) {
          setCandidates(list);
          if (list.length === 1) {
            setNewOwnerId(String(list[0].userId || ""));
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Failed to load transfer details.");
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

  const canTransfer = useMemo(() => {
    if (!confirmChecked) return false;
    if (!newOwnerId) return false;
    return true;
  }, [confirmChecked, newOwnerId]);

  function handleClose() {
    if (busy) return;
    if (onClose) {
      onClose();
      return;
    }
    router.back();
  }

  async function confirmTransfer() {
    if (busy) return;
    setError("");

    if (!canTransfer) {
      setError("Choose a new owner and confirm to transfer.");
      return;
    }

    setBusy(true);

    const res = await transferVaultOwnershipAction({
      vaultId,
      newOwnerId,
    });

    if (!res?.ok) {
      setError(res?.error || "Vault could not be transferred.");
      setBusy(false);
      return;
    }

    if (onTransferred) {
      onTransferred();
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
          Transferring changes the vault owner and moves reward prep ownership.
        </p>
        <p className="text-sm text-muted-fg">
          You will lose owner access after this completes.
        </p>
      </div>

      {loading ? <div className="text-sm text-muted-fg">Loading...</div> : null}

      {error ? <ErrorMessage error={error} /> : null}

      <div className="space-y-3">
        <div className="text-sm text-fg">
          Select a new owner for{" "}
          <span className="font-semibold">
            {vaultName || "this vault"}
          </span>
          .
        </div>
        <Select
          id="new-vault-owner"
          label="New owner"
          value={newOwnerId}
          onChange={(e) => setNewOwnerId(e.target.value)}
        >
          <option value="">Choose a member...</option>
          {candidates.map((row) => {
            const name = row?.name ? String(row.name) : "";
            const email = row?.email ? String(row.email) : "";
            const label = name && email ? `${name} - ${email}` : name || email;
            return (
              <option
                key={row.userId}
                value={row.userId}
              >
                {label || "Member"}
              </option>
            );
          })}
        </Select>
        <InputComponent
          id="confirm-vault-transfer"
          type="checkbox"
          label="I understand this will transfer ownership."
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
          onClick={confirmTransfer}
          className="px-3 py-2 rounded-lg disabled:opacity-50"
          disabled={busy || !canTransfer}
        >
          {busy ? "Transferring..." : "Transfer vault"}
        </Button>
      </div>
    </div>
  );
}
