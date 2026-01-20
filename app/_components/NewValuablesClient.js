"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LinkButton } from "@/app/_components/LinkButton";
import ValuablesForm from "@/app/_components/ValuablesForm";
import {
  createValuableAction,
  getDefaultValuablesAction,
} from "@/app/_lib/actions/valuables";
import { useVault } from "@/app/_context/VaultProvider";

/**
- Render the new valuable form.
- @param {{ isModal?: boolean }} props
- @returns {JSX.Element}
  */
export default function NewValuableClient({ isModal }) {
  const { vault, updateVault } = useVault();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [defaultValuables, setDefaultValuables] = useState([]);
  const vaultId = vault?.id;
  useEffect(() => {
    if (!vaultId) return;

    async function load() {
      setError("");
      const res = await getDefaultValuablesAction({ vaultId });

      if (!res.ok) {
        setDefaultValuables([]);
        setError(res.error || "Failed to load default valuables.");
        return;
      }

      setDefaultValuables(Array.isArray(res.data) ? res.data : []);
    }

    load();
  }, [vaultId]);

  async function handleCreate(payload) {
    setError("");

    if (!payload.name?.trim()) {
      setError("Name is required.");
      return;
    }

    if (!payload.container_id?.trim()) {
      setError("Container is required.");
      return;
    }

    setBusy(true);
    console.log("handlecreate");
    const res = await createValuableAction(payload);

    if (!res?.ok) {
      setError(res?.error || "Failed to create valuable.");
      setBusy(false);
      return;
    }

    setBusy(false);

    router.replace(`/account/vaults/${vault.id}/valuables`);
    router.refresh();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-fg space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {!isModal && <h1 className="text-2xl font-semibold">Add valuable</h1>}
          <p className="text-sm text-muted-fg">
            Create valuable manually, or pick from your system defaults.
          </p>
        </div>
        {!isModal && (
          <LinkButton
            href={`/account/vaults/${vault.id}/valuables`}
            variant="outline"
          >
            Back
          </LinkButton>
        )}
      </header>

      <ValuablesForm
        mode="new"
        vault={vault}
        updateVault={updateVault}
        defaultValuables={defaultValuables}
        submitting={busy}
        error={error}
        onSaved={handleCreate}
        onClose={() => {
          if (isModal) {
            router.back();
            return;
          }
          router.replace(`/account/vaults/${vault.id}/valuables`);
          router.refresh();
        }}
      />
    </div>
  );
}
