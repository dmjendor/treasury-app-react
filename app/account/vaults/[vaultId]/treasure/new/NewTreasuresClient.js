"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LinkButton } from "@/app/_components/LinkButton";
import TreasuresForm from "@/app/_components/TreasuresForm";
import { createTreasureAction } from "@/app/_lib/actions/treasures";

export default function NewTreasureClient({
  vaultId,
  editionId,
  containers,
  defaultTreasures,
  preselectContainerId,
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(payload) {
    setError("");

    if (!payload.container_id) return setError("Choose a container.");
    if (!payload.name?.trim()) return setError("Name is required.");

    setBusy(true);
    const res = await createTreasureAction(payload);

    if (!res?.ok) {
      setError(res?.error || "Failed to create treasure.");
      setBusy(false);
      return;
    }

    router.replace(`/account/vaults/${vaultId}/treasure`);
    router.refresh();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-(--fg) space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Add treasure</h1>
          <p className="text-sm text-(--muted-fg)">
            Create treasure manually, or pick from your edition defaults.
          </p>
        </div>

        <LinkButton
          href={`/account/vaults/${vaultId}/treasure`}
          variant="outline"
        >
          Back
        </LinkButton>
      </header>

      <TreasuresForm
        vaultId={vaultId}
        editionId={editionId}
        containers={containers}
        defaultTreasures={defaultTreasures}
        initialValues={{ container_id: preselectContainerId ?? "" }}
        submitting={busy}
        error={error}
        onSubmit={handleCreate}
        onCancel={() => router.replace(`/account/vaults/${vaultId}/treasure`)}
      />
    </div>
  );
}
