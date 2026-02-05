// app/@modal/(.)account/vaults/new/page.js
"use client";

import Modal from "@/app/_components/Modal";
import NewVaultWizard from "@/app/_components/NewVaultWizard";
import { useRouter } from "next/navigation";

/**
 * Render the new vault wizard in a modal.
 * @returns {JSX.Element}
 */
export default function Page() {
  const router = useRouter();

  function handleClose() {
    router.back();
    router.refresh();
  }

  function handleCreated() {
    router.back();
    router.refresh();
  }

  return (
    <Modal
      title="Create vault"
      onClose={handleClose}
    >
      <div className="p-4">
        <NewVaultWizard
          showTitle={false}
          onCreated={handleCreated}
        />
      </div>
    </Modal>
  );
}
