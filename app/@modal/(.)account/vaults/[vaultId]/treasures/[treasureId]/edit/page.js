"use client";

import { useParams, useRouter } from "next/navigation";
import Modal from "@/app/_components/Modal";
import TreasuresFormWithVault from "@/app/_components/TreasuresFormWithVault";

export default function Page() {
  const router = useRouter();
  const { treasureId } = useParams();

  function handleClose() {
    router.back();
    router.refresh();
  }

  return (
    <Modal title="Edit Treasure">
      <TreasuresFormWithVault
        mode="edit"
        treasureId={treasureId}
        onClose={handleClose}
      />
    </Modal>
  );
}
