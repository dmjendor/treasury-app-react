"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LinkButton } from "@/app/_components/LinkButton";
import TreasuresForm from "@/app/_components/TreasuresForm";
import {
  createTreasureAction,
  getDefaultTreasuresAction,
} from "@/app/_lib/actions/treasures";
import { useVault } from "@/app/_context/VaultProvider";

/**
- Render the new treasure form.
- @param {{ isModal?: boolean }} props
- @returns {JSX.Element}
  */
export default function NewTreasureClient({ isModal }) {
  const { vault, updateVault } = useVault();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [defaultTreasures, setDefaultTreasures] = useState([]);
  const vaultId = vault?.id;
  useEffect(() => {
    if (!vaultId) return;

    async function load() {
      setError("");
      const res = await getDefaultTreasuresAction({ vaultId });

      if (!res.ok) {
        setDefaultTreasures([]);
        setError(res.error || "Failed to load default treasures.");
        return;
      }

      setDefaultTreasures(Array.isArray(res.data) ? res.data : []);
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
    const res = await createTreasureAction(payload);

    if (!res?.ok) {
      setError(res?.error || "Failed to create treasure.");
      setBusy(false);
      return;
    }

    setBusy(false);

    if (isModal) {
      router.back(); // close modal
      router.refresh(); // refresh underlying page data
      return;
    }

    router.replace(`/account/vaults/${vault.id}/treasures`);
    router.refresh();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-fg space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {!isModal && <h1 className="text-2xl font-semibold">Add treasure</h1>}
          <p className="text-sm text-muted-fg">
            Create treasure manually, or pick from the game systems default
            treasures.
          </p>
        </div>
        {!isModal && (
          <LinkButton
            href={`/account/vaults/${vault.id}/treasures`}
            variant="outline"
          >
            Back
          </LinkButton>
        )}
      </header>

      <TreasuresForm
        mode="new"
        vault={vault}
        updateVault={updateVault}
        defaultTreasures={defaultTreasures}
        submitting={busy}
        error={error}
        onSaved={handleCreate}
        onClose={() => {
          if (isModal) {
            router.back();
            return;
          }
          router.replace(`/account/vaults/${vault.id}/treasures`);
          router.refresh();
        }}
      />
    </div>
  );
}
