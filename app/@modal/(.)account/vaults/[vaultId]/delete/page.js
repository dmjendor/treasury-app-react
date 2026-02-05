// app/@modal/(.)account/vaults/[vaultId]/delete/page.js
"use client";

import { useParams, useRouter } from "next/navigation";
import Modal from "@/app/_components/Modal";
import DeleteVault from "@/app/_components/DeleteVault";

/**
 * Render the delete vault modal.
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

  function handleDeleted() {
    if (typeof window !== "undefined") {
      window.location.assign("/account/vaults");
      return;
    }
    router.replace("/account/vaults");
  }

  return (
    <Modal title="Delete Vault">
      <DeleteVault
        vaultId={vaultId}
        onClose={handleClose}
        onDeleted={handleDeleted}
      />
    </Modal>
  );
}
