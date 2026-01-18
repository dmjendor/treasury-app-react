import Modal from "@/app/_components/Modal";
import TreasuresFormWithVault from "@/app/_components/TreasuresFormWithVault";

/**
- Render the new treasure modal.
- @returns {Promise<JSX.Element>}
  */
export default async function Page() {
  return (
    <Modal title="Add Treasure">
      <TreasuresFormWithVault mode="create" />
    </Modal>
  );
}
