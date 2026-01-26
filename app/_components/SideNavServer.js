import { auth } from "@/app/_lib/auth";
import { getMemberVaultsForUser } from "@/app/_lib/data/vaults.data";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import SideNavigation from "@/app/_components/SideNavigation";

export default async function SideNavServer({ vaultId } = {}) {
  const session = await auth();
  const userId = session?.user?.userId;

  let memberVaultLinks = [];
  let currentVault = null;

  if (userId) {
    const { data, error } = await getMemberVaultsForUser(userId);
    if (!error && data?.length) {
      memberVaultLinks = data
        .slice()
        .sort((a, b) =>
          String(a?.name || "").localeCompare(String(b?.name || "")),
        )
        .map((v) => ({
          id: v.id,
          name: v.name || "Untitled Vault",
          href: `/public/vaults/${v.id}`,
        }));
    }
  }

  if (vaultId) {
    currentVault = await getVaultById(vaultId);
  }

  return (
    <SideNavigation
      memberVaultLinks={memberVaultLinks}
      userId={userId}
      currentVault={currentVault}
    />
  );
}
