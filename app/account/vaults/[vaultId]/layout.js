import { ThemeScope } from "@/app/_components/ThemeScope";
import VaultHeader from "@/app/_components/VaultHeader";
import { VaultProvider } from "@/app/_context/VaultProvider";
import { getVaultById } from "@/app/_lib/data/vaults.data";

export default async function VaultLayout({ children, params }) {
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
      <ThemeScope themeKey={themeKey}>
        <div className="min-h-screen bg-bg text-fg space-y-6 p-2">
          <VaultHeader />
          {children}
        </div>
      </ThemeScope>
    </VaultProvider>
  );
}
