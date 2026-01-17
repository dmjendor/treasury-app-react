"use client";

import { useParams, useRouter } from "next/navigation";
import Modal from "@/app/_components/Modal";
import CurrencyFormWithVault from "@/app/_components/CurrencyFormWithVault";

export default function Page() {
  const router = useRouter();
  const { currencyId } = useParams();

  function handleClose() {
    router.back();
    router.refresh();
  }

  return (
    <Modal title="Edit Currency">
      <CurrencyFormWithVault
        mode="edit"
        currencyId={currencyId}
        onClose={handleClose}
      />
    </Modal>
  );
}
