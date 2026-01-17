"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/Button";
import { LinkButton } from "@/app/_components/LinkButton";
import { deleteCurrencyAction } from "@/app/_lib/actions/currencies";

export default function CurrencyDeleteClient({ vaultId, currencyId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const missingParams = !vaultId || !currencyId;
  const error = missingParams ? "Missing route parameters." : actionError;

  async function onConfirm() {
    if (missingParams) return;

    setBusy(true);
    setActionError("");

    try {
      const res = await deleteCurrencyAction({ vaultId, currencyId });

      if (!res?.ok) {
        setActionError(res?.error || "Delete failed.");
        setBusy(false);
        return;
      }

      router.replace(`/account/vaults/${vaultId}/currencies`);
      router.refresh();
    } catch (e) {
      setActionError(e?.message || "Delete failed.");
      setBusy(false);
    }
  }

  function onCancel() {
    if (!vaultId) return;
    router.replace(`/account/vaults/${vaultId}/currencies`);
  }

  return (
    <div className="p-6 max-w-xl mx-auto text-fg">
      <div className="overflow-hidden rounded-2xl border border-border bg-card text-fg">
        <div className="px-5 py-4 bg-danger-700 text-danger-50 border-b border-border">
          <h1 className="text-xl font-semibold">Delete currency</h1>
          <p className="text-sm opacity-90">This action can’t be undone.</p>
        </div>

        <div className="p-5 space-y-4">
          {error ? (
            <div className="p-3 rounded-lg border border-danger-600 bg-danger-100 text-sm text-danger-700">
              {error}
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button
              variant="danger"
              disabled={busy || missingParams}
              onClick={onConfirm}
            >
              {busy ? "Deleting..." : "Confirm delete"}
            </Button>

            <Button
              variant="primary"
              disabled={busy || !vaultId}
              onClick={onCancel}
            >
              Cancel
            </Button>

            {vaultId ? (
              <LinkButton
                href={`/account/vaults/${vaultId}/currencies`}
                variant="outline"
                className="ml-auto"
              >
                Back to list
              </LinkButton>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
