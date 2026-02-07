// app/account/vaults/[vaultId]/treasures/[treasureId]/view/page.js
"use client";

import { useParams, useRouter } from "next/navigation";
import TreasureView from "@/app/_components/TreasureView";

/**
 * Render the treasure view page.
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
    <TreasureView
      vaultId={String(vaultId || "")}
      treasureId={String(treasureId || "")}
      onClose={handleClose}
    />
  );
}
