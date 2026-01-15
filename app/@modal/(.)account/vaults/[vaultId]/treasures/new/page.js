import Modal from "@/app/_components/Modal";
import NewTreasuresClient from "@/app/_components/NewTreasuresClient";
import { getVaultById } from "@/app/_lib/data/vaults.data";

/**
- Render the new treasure modal with vault data and whether or not its in a modal
- @param {{ params: { vaultId: string, usModal: boolean } }} props
- @returns {Promise<JSX.Element>}
  */
export default async function Page({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const { vaultId } = resolvedParams;
  const vault = await getVaultById(vaultId);
  console.log(vault);
  return (
    <Modal
      title="Add Treasure"
      themeKey={vault?.theme?.theme_key}
    >
      <NewTreasuresClient
        vault={vault}
        isModal={true}
      />
    </Modal>
  );
}
