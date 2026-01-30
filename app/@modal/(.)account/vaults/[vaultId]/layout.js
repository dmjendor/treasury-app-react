/**
 * Vault-scoped modal layout.
 */
import { ThemeScope } from "@/app/_components/ThemeScope";
import { VaultProvider } from "@/app/_context/VaultProvider";
import { auth } from "@/app/_lib/auth";
import { getVaultMemberPreferenceForUserAndVault } from "@/app/_lib/data/vaultMemberPreferences.data";
import { getVaultById } from "@/app/_lib/data/vaults.data";

/**
- Provide vault context for vault-scoped modals.
- @param {{ children: React.ReactNode, params: { vaultId: string } }} props
- @returns {Promise<JSX.Element>}
  */
export default async function VaultModalLayout({ children, params }) {
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
      <ThemeScope themeKey={themeKey}>{children}</ThemeScope>
    </VaultProvider>
  );
}
