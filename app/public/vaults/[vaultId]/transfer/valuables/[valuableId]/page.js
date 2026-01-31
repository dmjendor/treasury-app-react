// app/public/vaults/[vaultId]/transfer/valuables/[valuableId]/page.js
import TransferItemClient from "@/app/_components/TransferItemClient";
import { auth } from "@/app/_lib/auth";
import { getContainersForVault } from "@/app/_lib/data/containers.data";
import {
  getPermissionByVaultAndUserId,
  getTransferVaultsForUser,
} from "@/app/_lib/data/permissions.data";
import { getValuableForVaultByIdAction } from "@/app/_lib/actions/valuables";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { getRouteParams } from "@/app/_lib/routing/params";
import { notFound } from "next/navigation";

function normalizeTargetVaults(rows, currentVaultId) {
  const list = [];
  for (const row of rows || []) {
    const vault = row?.vaults;
    if (!vault) continue;
    if (String(vault.id) === String(currentVaultId)) continue;
    if (!row?.vaults?.allow_xfer_in) continue;
    if (!row?.transfer_valuables_in) continue;
    list.push({ id: vault.id, name: vault.name || "Untitled vault" });
  }
  list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  return list;
}

/**
 * Render the transfer valuable page.
 * @param {{ params: Promise<Record<string,string>> | Record<string,string> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function Page({ params }) {
  const { vaultId, valuableId } = await getRouteParams(params);
  const session = await auth();
  if (!session?.user?.userId) {
    return (
      <div className="p-6 text-fg">
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-fg">
          You must be logged in to transfer valuables.
        </div>
      </div>
    );
  }

  const userId = session.user.userId;

  const [vault, valuableRes, permRes, transferRes] = await Promise.all([
    getVaultById(vaultId),
    getValuableForVaultByIdAction({ vaultId, valuableId }),
    getPermissionByVaultAndUserId(vaultId, userId),
    getTransferVaultsForUser(userId),
  ]);
  if (!vault) notFound();
  if (!valuableRes?.ok) notFound();

  const valuable = valuableRes.data;

  const permission = Array.isArray(permRes?.data) ? permRes.data[0] : null;
  const canTransferOut =
    Boolean(vault?.allow_xfer_out) &&
    (String(vault?.user_id) === String(userId) ||
      Boolean(permission?.transfer_valuables_out));

  if (!canTransferOut) {
    return (
      <div className="p-6 text-fg">
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-fg">
          You do not have permission to transfer valuables from this vault.
        </div>
      </div>
    );
  }

  const targetVaults = normalizeTargetVaults(transferRes?.data, vaultId);
  const initialVaultId = targetVaults?.[0]?.id || "";
  const initialContainers = initialVaultId
    ? await getContainersForVault(initialVaultId)
    : [];

  return (
    <TransferItemClient
      fromVaultId={String(vaultId)}
      fromVaultName={vault?.name || "Vault"}
      itemType="valuable"
      itemId={String(valuable?.id || valuableId)}
      itemName={valuable?.name || "Valuable"}
      fromContainerName={
        vault?.containerList?.find(
          (c) => String(c.id) === String(valuable?.container_id),
        )?.name || ""
      }
      targetVaults={targetVaults}
      initialContainers={Array.isArray(initialContainers) ? initialContainers : []}
      isModal={false}
    />
  );
}
