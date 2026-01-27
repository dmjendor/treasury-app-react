"use client";

import { useParams, useRouter } from "next/navigation";
import TreasuresFormWithVault from "@/app/_components/TreasuresFormWithVault";
import { updateTreasureAction } from "@/app/_lib/actions/treasures";

export default function Page() {
  const router = useRouter();
  const { treasureId, vaultId } = useParams();

  function handleClose() {
    router.back();
    router.refresh();
  }

  async function handleSaved(payload) {
    const res = await updateTreasureAction({
      id: treasureId,
      vaultId: vaultId || payload?.vault_id,
      patch: payload,
    });

    if (!res?.ok) {
      console.error(res?.error || "Failed to update treasure.");
      return;
    }

    router.replace(`/account/vaults/${vaultId}/treasures`);
    router.refresh();
  }

  return (
    <TreasuresFormWithVault
      mode="edit"
      treasureId={treasureId}
      onClose={handleClose}
      onSaved={handleSaved}
    />
  );
}
