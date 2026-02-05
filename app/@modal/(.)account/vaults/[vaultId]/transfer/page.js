// app/@modal/(.)account/vaults/[vaultId]/transfer/page.js
"use client";

import { useParams, useRouter } from "next/navigation";
import Modal from "@/app/_components/Modal";
import TransferVault from "@/app/_components/TransferVault";

/**
 * Render the transfer vault modal.
 * @returns {JSX.Element}
 */
export default function Page() {
  const router = useRouter();
  const params = useParams();

  const vaultId = params?.vaultId ? String(params.vaultId) : "";

  function handleClose() {
    router.back();
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
    <Modal title="Transfer Vault">
      <TransferVault
        vaultId={vaultId}
        onClose={handleClose}
        onTransferred={handleTransferred}
      />
    </Modal>
  );
}
