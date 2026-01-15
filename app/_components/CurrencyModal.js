"use client";

import CurrencyForm from "@/app/_components/CurrencyForm";
import Modal from "@/app/_components/Modal";

export default function CurrencyModal(props) {
  return (
    <Modal title="Edit Currency">
      <CurrencyForm
        {...props}
        onClose={close}
      />
    </Modal>
  );
}
