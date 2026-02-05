// app/account/vaults/[vaultId]/transfer/page.js
"use client";

import { useParams, useRouter } from "next/navigation";
import TransferVault from "@/app/_components/TransferVault";

/**
 * Render the transfer vault page.
 * @returns {JSX.Element}
 */
export default function Page() {
  const router = useRouter();
  const params = useParams();

  const vaultId = params?.vaultId ? String(params.vaultId) : "";

  function handleClose() {
    if (!vaultId) {
      router.back();
      return;
    }

    router.replace(`/account/vaults/${encodeURIComponent(vaultId)}/settings`);
    router.refresh();
  }

  function handleTransferred() {
    if (typeof window !== "undefined") {
      window.location.assign("/account/vaults");
      return;
    }
    router.replace("/account/vaults");
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <TransferVault
        vaultId={vaultId}
        onClose={handleClose}
        onTransferred={handleTransferred}
      />
    </div>
  );
}
