/**
 * Vault-scoped modal layout.
 */
import { ThemeScope } from "@/app/_components/ThemeScope";
import { VaultProvider } from "@/app/_context/VaultProvider";
import { ValueUnitProvider } from "@/app/_context/ValueUnitProvider";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { notFound } from "next/navigation";

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
  if (!vault) notFound();

  const themeKeyValue = vault?.themeKey || "night";
  const themeKey = String(themeKeyValue).startsWith("theme-")
    ? String(themeKeyValue)
    : `theme-${themeKeyValue}`;

  return (
    <VaultProvider
      vault={vault}
      key={vault?.id ?? "no-vault"}
    >
      <ValueUnitProvider defaultUnit="common">
        <ThemeScope themeKey={themeKey}>{children}</ThemeScope>
      </ValueUnitProvider>
    </VaultProvider>
  );
}
