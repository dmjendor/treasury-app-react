// app/@modal/(.)account/vaults/[vaultId]/valuables/[valuableId]/delete/page.js
"use client";

import Modal from "@/app/_components/Modal";
import DeleteValuable from "@/app/_components/DeleteValuable";
import { useParams, useRouter } from "next/navigation";

/**
 * Render the delete valuable modal.
 * @returns {JSX.Element}
 */
export default function Page() {
  const router = useRouter();
  const params = useParams();

  const vaultId = params?.vaultId ? String(params.vaultId) : "";
  const valuableId = params?.valuableId ? String(params.valuableId) : "";

  function handleClose() {
    router.back();
    router.refresh();
  }

  return (
    <Modal title="Delete Valuable">
      <DeleteValuable
        vaultId={vaultId}
        valuableId={valuableId}
        onClose={handleClose}
      />
    </Modal>
  );
}
