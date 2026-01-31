// Public vault overview page.
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { getVaultCurrencyBalances } from "@/app/_lib/data/holdings.data";
import { getTreasuresForVault } from "@/app/_lib/data/treasures.data";
import { getValuablesForVault } from "@/app/_lib/data/valuables.data";
import PublicVaultOverviewClient from "@/app/public/vaults/[vaultId]/PublicVaultOverviewClient";
import { auth } from "@/app/_lib/auth";
import { getRouteParams } from "@/app/_lib/routing/params";
import { getPermissionByVaultAndUserId } from "@/app/_lib/data/permissions.data";
import { notFound } from "next/navigation";

/**
 * Render the public vault overview.
 * @param {{ params: { vaultId: string } }} props
 * @returns {Promise<JSX.Element>}
 */
export async function generateMetadata({ params }) {
  const { vaultId } = await getRouteParams(params);
  const vault = await getVaultById(vaultId);
  return {
    title: vault?.name || "Vault",
  };
}

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
  if (!vault) notFound();

  const session = await auth();
  const userId = session?.user?.userId || null;
  const isOwner = userId && session?.user?.userId === vault?.user_id;
  const permRes = userId
    ? await getPermissionByVaultAndUserId(vaultId, userId)
    : { data: [] };
  const permission = Array.isArray(permRes?.data) ? permRes.data[0] : null;
  const allowTransfersOut = Boolean(vault?.allow_xfer_out);
  const canTransferTreasureOut =
    allowTransfersOut &&
    (Boolean(isOwner) || Boolean(permission?.transfer_treasures_out));
  const canTransferValuableOut =
    allowTransfersOut &&
    (Boolean(isOwner) || Boolean(permission?.transfer_valuables_out));

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
      canTransferTreasureOut={canTransferTreasureOut}
      canTransferValuableOut={canTransferValuableOut}
    />
  );
}
