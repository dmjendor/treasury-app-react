"use client";

import CreateMenu from "./CreateMenu";
import IconComponent from "@/app/_components/IconComponent";
import { useVault } from "@/app/_context/VaultProvider";

/**
 *
- Render the vault heading and actions.
- @returns {JSX.Element}
 */
export default function VaultHeader() {
  const { vault } = useVault();
  const vaultId = vault?.id ?? null;
  return (
    <div className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-accent-700 p-2">
          <IconComponent
            size="2xl"
            icon="/svg/chest.svg"
            label="Treasure chest"
            variant="accent"
          />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-fg">
            {vault?.name || "Untitled Vault"}
          </h1>
          <p className="text-xs text-muted-fg">Vault</p>
        </div>
      </div>

      {/* Placeholder for future actions */}
      <div className="flex items-center gap-2">
        {/* Example future slot */}
        {vaultId ? <CreateMenu vaultId={vaultId} /> : null}
      </div>
    </div>
  );
}
