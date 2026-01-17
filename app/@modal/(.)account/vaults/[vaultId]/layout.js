/**
 * Vault-scoped modal layout.
 */
import { ThemeScope } from "@/app/_components/ThemeScope";
import { VaultProvider } from "@/app/_context/VaultProvider";
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
  const vault = await getVaultById(vaultId);

  const themeKey = vault?.themeKey ? `theme-${vault.themeKey}` : "theme-night";

  return (
    <VaultProvider
      vault={vault}
      key={vault?.id ?? "no-vault"}
    >
      <ThemeScope themeKey={themeKey}>{children}</ThemeScope>
    </VaultProvider>
  );
}
