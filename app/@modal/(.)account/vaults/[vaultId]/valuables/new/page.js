"use client";
import Modal from "@/app/_components/Modal";
import ValuablesFormWithVault from "@/app/_components/ValuablesFormWithVault";

/**
- Render the new valuable modal.
- @returns {Promise<JSX.Element>}
  */
export default function Page() {
  return (
    <Modal title="Add Valuable">
      <ValuablesFormWithVault mode="create" />
    </Modal>
  );
}
