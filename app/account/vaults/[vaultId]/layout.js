import { ThemeScope } from "@/app/_components/ThemeScope";
import VaultHeader from "@/app/_components/VaultHeader";
import { VaultProvider } from "@/app/_context/VaultProvider";
import { ValueUnitProvider } from "@/app/_context/ValueUnitProvider";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { notFound } from "next/navigation";

export default async function VaultLayout({ children, params }) {
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
        <ThemeScope themeKey={themeKey}>
          <div className="min-h-screen bg-bg text-fg space-y-6 p-2">
            <VaultHeader />
            {children}
          </div>
        </ThemeScope>
      </ValueUnitProvider>
    </VaultProvider>
  );
}
