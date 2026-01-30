import AccountClient from "@/app/_components/AccountClient";
import { auth } from "@/app/_lib/auth";
import { getThemes } from "@/app/_lib/data/themes.data";
import { getUserById } from "@/app/_lib/data/users.data";
import {
  getMemberVaultsForUser,
  getUserVaults,
} from "@/app/_lib/data/vaults.data";
import { getVaultMemberPreferencesForUser } from "@/app/_lib/data/vaultMemberPreferences.data";

export const metadata = {
  title: "Account",
};

async function page() {
  const session = await auth();
  if (!session?.user?.userId) {
    return (
      <div className="p-6 text-fg">
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-fg">
          You must be logged in to view this page.
        </div>
      </div>
    );
  }

  const userId = session.user.userId;

  const [
    user,
    ownedVaults,
    memberVaultsResult,
    preferences,
    themes,
  ] = await Promise.all([
    getUserById(userId),
    getUserVaults(),
    getMemberVaultsForUser(userId),
    getVaultMemberPreferencesForUser(userId),
    getThemes(),
  ]);

  const memberVaults = Array.isArray(memberVaultsResult?.data)
    ? memberVaultsResult.data
    : [];

  const vaultMap = new Map();
  for (const vault of ownedVaults || []) {
    vaultMap.set(String(vault.id), vault);
  }
  for (const vault of memberVaults || []) {
    if (!vault) continue;
    if (!vaultMap.has(String(vault.id))) {
      vaultMap.set(String(vault.id), vault);
    }
  }

  const prefMap = new Map(
    (preferences || []).map((pref) => [String(pref.vault_id), pref]),
  );

  const vaultRows = [...vaultMap.values()].map((vault) => {
    const pref = prefMap.get(String(vault.id));
    const role =
      String(vault.user_id) === String(userId) ? "Owner" : "Member";
    return {
      id: vault.id,
      name: vault.name || "Untitled vault",
      role,
      displayName: pref?.display_name || "",
      themeKey: pref?.theme_key || "",
    };
  });

  return (
    <AccountClient
      user={{
        id: user?.id,
        name: user?.name || session.user.name || "",
        email: user?.email || session.user.email || "",
        source: user?.source || "",
        theme_id: user?.theme_id || "",
      }}
      vaults={vaultRows}
      themes={Array.isArray(themes) ? themes : []}
    />
  );
}

export default page;
