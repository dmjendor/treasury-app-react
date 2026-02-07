// app/@modal/(.)account/vaults/[vaultId]/valuables/[valuableId]/edit/page.js
"use client";

import { useParams, useRouter } from "next/navigation";
import Modal from "@/app/_components/Modal";
import ValuablesFormWithVault from "@/app/_components/ValuablesFormWithVault";
import { updateValuableAction } from "@/app/_lib/actions/valuables";
import { useGlobalUI } from "@/app/_context/GlobalUIProvider";

/**
 * Render the edit valuable modal.
 * @returns {JSX.Element}
 */
export default function Page() {
  const router = useRouter();
  const { toggleSpinner } = useGlobalUI();
  const { valuableId, vaultId } = useParams();

  function handleClose() {
    router.back();
    router.refresh();
  }

  async function handleSaved(payload) {
    toggleSpinner(true, "Saving");
    const res = await updateValuableAction({
      id: valuableId,
      vaultId: vaultId || payload?.vault_id,
      patch: payload,
    });

    if (!res?.ok) {
      toggleSpinner(false);
      console.error(res?.error || "Failed to update valuable.");
      return;
    }

    toggleSpinner(false);
    router.back();
    router.refresh();
  }

  return (
    <Modal title="Edit Valuable">
      <ValuablesFormWithVault
        mode="edit"
        valuableId={valuableId}
        onClose={handleClose}
        onSaved={handleSaved}
      />
    </Modal>
  );
}
