import CurrencyFormWithVault from "@/app/_components/CurrencyFormWithVault";
import Modal from "@/app/_components/Modal";
import React from "react";

export default function Page() {
  return (
    <Modal title="Add Currency">
      <CurrencyFormWithVault mode="create" />
    </Modal>
  );
}
