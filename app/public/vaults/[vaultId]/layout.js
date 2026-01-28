// Public vault scoped layout.
import { ThemeScope } from "@/app/_components/ThemeScope";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { getRouteParams } from "@/app/_lib/routing/params";

/**
 * Render the public vault layout with theme scope.
 * @param {{ children: React.ReactNode, params: Promise<Record<string,string>> | Record<string,string> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function Layout({ children, params }) {
  const { vaultId } = await getRouteParams(params);
  const vault = await getVaultById(vaultId);
  const themeKey = vault?.themeKey ? `theme-${vault.themeKey}` : "theme-night";

  return <ThemeScope themeKey={themeKey}>{children}</ThemeScope>;
}
