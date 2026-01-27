"use client";

import { useParams, useRouter } from "next/navigation";
import Modal from "@/app/_components/Modal";
import TreasuresFormWithVault from "@/app/_components/TreasuresFormWithVault";
import { updateTreasureAction } from "@/app/_lib/actions/treasures";
import { useGlobalUI } from "@/app/_context/GlobalUIProvider";

export default function Page() {
  const router = useRouter();
  const { toggleSpinner } = useGlobalUI();
  const { treasureId, vaultId } = useParams();

  function handleClose() {
    router.back();
    router.refresh();
  }

  async function handleSaved(payload) {
    toggleSpinner(true, "Saving");
    const res = await updateTreasureAction({
      id: treasureId,
      vaultId: vaultId || payload?.vault_id,
      patch: payload,
    });

    if (!res?.ok) {
      toggleSpinner(false);
      console.error(res?.error || "Failed to update treasure.");
      return;
    }
    toggleSpinner(false);
    router.back();
    router.refresh();
  }

  return (
    <Modal title="Edit Treasure">
      <TreasuresFormWithVault
        mode="edit"
        treasureId={treasureId}
        onClose={handleClose}
        onSaved={handleSaved}
      />
    </Modal>
  );
}
