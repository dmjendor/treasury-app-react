// app/@modal/(.)account/vaults/[vaultId]/treasures/[treasureId]/view/page.js
"use client";

import { useParams, useRouter } from "next/navigation";
import Modal from "@/app/_components/Modal";
import TreasureView from "@/app/_components/TreasureView";

/**
 * Render the treasure view modal.
 * @returns {JSX.Element}
 */
export default function Page() {
  const router = useRouter();
  const { treasureId, vaultId } = useParams();

  function handleClose() {
    router.back();
    router.refresh();
  }

  return (
    <Modal title="Treasure">
      <TreasureView
        vaultId={String(vaultId || "")}
        treasureId={String(treasureId || "")}
        onClose={handleClose}
      />
    </Modal>
  );
}
