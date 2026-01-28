// app/account/vaults/[vaultId]/holdings/new/page.js
import HoldingsFormClient from "@/app/_components/HoldingsFormClient";
import { getCurrenciesForVault } from "@/app/_lib/data/currencies.data";
import { getRouteParams } from "@/app/_lib/routing/params";

/**
 * Render the new holdings page.
 * @param {{ params: Promise<Record<string,string>> | Record<string,string> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function Page({ params }) {
  const { vaultId } = await getRouteParams(params);
  const currencies = await getCurrenciesForVault(vaultId);

  return (
    <HoldingsFormClient
      vaultId={String(vaultId)}
      currencies={Array.isArray(currencies) ? currencies : []}
      isModal={false}
    />
  );
}
