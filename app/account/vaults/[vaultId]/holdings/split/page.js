// app/account/vaults/[vaultId]/holdings/split/page.js
import SplitHoldingsFormClient from "@/app/_components/SplitHoldingsFormClient";
import { getVaultCurrencyBalances } from "@/app/_lib/data/holdings.data";
import { getMembersByVaultId } from "@/app/_lib/data/permissions.data";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { getRouteParams } from "@/app/_lib/routing/params";

function countMembersExcludingOwner(members, ownerId) {
  const list = Array.isArray(members) ? members : [];
  return list.filter(
    (member) => String(member.user_id) !== String(ownerId),
  ).length;
}

/**
 * Render the split holdings page.
 * @param {{ params: Promise<Record<string,string>> | Record<string,string> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function Page({ params }) {
  const { vaultId } = await getRouteParams(params);

  const [vault, balances, membersResult] = await Promise.all([
    getVaultById(vaultId),
    getVaultCurrencyBalances(vaultId),
    getMembersByVaultId(vaultId),
  ]);

  const members = Array.isArray(membersResult?.data)
    ? membersResult.data
    : [];
  const defaultMemberCount = countMembersExcludingOwner(
    members,
    vault?.user_id,
  );

  const mergeSplit = (vault?.merge_split ?? "base") === "base";

  return (
    <SplitHoldingsFormClient
      vaultId={String(vaultId)}
      balances={Array.isArray(balances) ? balances : []}
      currencies={Array.isArray(vault?.currencyList) ? vault.currencyList : []}
      defaultMemberCount={defaultMemberCount}
      mergeSplit={mergeSplit}
      treasurySplitEnabled={vault?.treasury_split_enabled ?? true}
      isModal={false}
    />
  );
}
