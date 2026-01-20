import Modal from "@/app/_components/Modal";
import NewTreasuresClient from "@/app/_components/NewTreasuresClient";

/**
- Render the new treasure modal.
- @returns {Promise<JSX.Element>}
  */
export default async function Page() {
  return (
    <Modal title="Add Treasure">
      <NewTreasuresClient isModal />
    </Modal>
  );
}
