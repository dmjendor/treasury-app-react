import NewTreasuresClient from "@/app/_components/NewTreasuresClient";
import { getVaultById } from "@/app/_lib/data/vaults.data";

export default async function Page({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const { vaultId } = resolvedParams;
  const vault = await getVaultById(vaultId);
  return (
    <NewTreasuresClient
      vault={vault}
      isModal={false}
    />
  );
}
