"use client";
import DeleteTreasure from "@/app/_components/DeleteTreasure";

import Modal from "@/app/_components/Modal";
import { useParams, useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const params = useParams();

  const vaultId = params?.vaultId ? String(params.vaultId) : "";
  const treasureId = params?.treasureId ? String(params.treasureId) : "";

  function handleClose() {
    router.back();
    router.refresh();
  }

  return (
    <Modal title="Delete Treasure">
      <DeleteTreasure
        vaultId={vaultId}
        treasureId={treasureId}
        onClose={handleClose}
      />
    </Modal>
  );
}
