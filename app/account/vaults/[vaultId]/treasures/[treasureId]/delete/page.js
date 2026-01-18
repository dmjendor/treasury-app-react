"use client";

import DeleteTreasure from "@/app/_components/DeleteTreasure";
import { useParams, useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const params = useParams();

  const vaultId = params?.vaultId ? String(params.vaultId) : "";
  const treasureId = params?.treasureId ? String(params.treasureId) : "";

  function handleClose() {
    if (!vaultId) {
      router.back();
      return;
    }

    router.replace(`/account/vaults/${encodeURIComponent(vaultId)}/treasures`);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <DeleteTreasure
        vaultId={vaultId}
        treasureId={treasureId}
        onClose={handleClose}
      />
    </div>
  );
}
