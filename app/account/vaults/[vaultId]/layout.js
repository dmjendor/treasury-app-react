import VaultHeader from "@/app/_components/VaultHeader";
import { getVaultById } from "@/app/_lib/data/vaults.data";

export default async function VaultLayout({ children, params }) {
  const { vaultId } = await params;
  const vault = await getVaultById(vaultId);

  return (
    <div className="space-y-6">
      <VaultHeader vault={vault} />
      {children}
    </div>
  );
}
