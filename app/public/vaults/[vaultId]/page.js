// Public vault overview page.
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { getVaultCurrencyBalances } from "@/app/_lib/data/holdings.data";
import { getTreasuresForVault } from "@/app/_lib/data/treasures.data";
import { getValuablesForVault } from "@/app/_lib/data/valuables.data";
import PublicVaultOverviewClient from "@/app/public/vaults/[vaultId]/PublicVaultOverviewClient";
import { auth } from "@/app/_lib/auth";

/**
 * Render the public vault overview.
 * @param {{ params: { vaultId: string } }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function PublicVaultPage({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const { vaultId } = resolvedParams;
  const [vault, balances, treasures, valuables] = await Promise.all([
    getVaultById(vaultId),
    getVaultCurrencyBalances(vaultId),
    getTreasuresForVault(vaultId),
    getValuablesForVault(vaultId),
  ]);

  const session = await auth();
  const isOwner = session?.user?.userId === vault?.user_id;

  const containers = (vault?.containerList ?? [])
    .slice()
    .sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
  const currencies = (vault?.currencyList ?? [])
    .slice()
    .sort((a, b) => Number(a?.rate || 0) - Number(b?.rate || 0));

  return (
    <PublicVaultOverviewClient
      vaultId={String(vaultId)}
      vault={vault}
      balances={Array.isArray(balances) ? balances : []}
      containers={containers}
      currencies={currencies}
      treasures={Array.isArray(treasures) ? treasures : []}
      valuables={Array.isArray(valuables) ? valuables : []}
      isOwner={Boolean(isOwner)}
    />
  );
}
