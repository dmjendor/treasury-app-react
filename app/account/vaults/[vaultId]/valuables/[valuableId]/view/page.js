// app/account/vaults/[vaultId]/valuables/[valuableId]/view/page.js
"use client";

import { useParams, useRouter } from "next/navigation";
import ValuableView from "@/app/_components/ValuableView";

/**
 * Render the valuable view page.
 * @returns {JSX.Element}
 */
export default function Page() {
  const router = useRouter();
  const { valuableId, vaultId } = useParams();

  function handleClose() {
    router.back();
    router.refresh();
  }

  return (
    <ValuableView
      vaultId={String(vaultId || "")}
      valuableId={String(valuableId || "")}
      onClose={handleClose}
    />
  );
}
