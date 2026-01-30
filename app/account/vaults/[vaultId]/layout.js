import { ThemeScope } from "@/app/_components/ThemeScope";
import VaultHeader from "@/app/_components/VaultHeader";
import { VaultProvider } from "@/app/_context/VaultProvider";
import { auth } from "@/app/_lib/auth";
import { getVaultMemberPreferenceForUserAndVault } from "@/app/_lib/data/vaultMemberPreferences.data";
import { getVaultById } from "@/app/_lib/data/vaults.data";

export default async function VaultLayout({ children, params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const { vaultId } = resolvedParams;

  const [vault, session] = await Promise.all([
    getVaultById(vaultId),
    auth(),
  ]);

  const memberPreference =
    session?.user?.userId && vaultId
      ? await getVaultMemberPreferenceForUserAndVault({
          userId: session.user.userId,
          vaultId,
        })
      : null;

  if (session?.user) {
    session.user.theme_key = memberPreference?.theme_key || null;
  }

  const themeKeyValue =
    memberPreference?.theme_key || vault?.themeKey || "night";
  const themeKey = String(themeKeyValue).startsWith("theme-")
    ? String(themeKeyValue)
    : `theme-${themeKeyValue}`;

  return (
    <VaultProvider
      vault={vault}
      key={vault?.id ?? "no-vault"}
    >
      <ThemeScope themeKey={themeKey}>
        <div className="min-h-screen bg-bg text-fg space-y-6 p-2">
          <VaultHeader />
          {children}
        </div>
      </ThemeScope>
    </VaultProvider>
  );
}
