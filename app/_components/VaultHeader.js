"use client";

import CreateMenu from "./CreateMenu";
import Card from "@/app/_components/Card";
import IconComponent from "@/app/_components/IconComponent";
import ChestIcon from "@/app/_components/icons/ChestIcon";
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
    <Card className="mb-6 flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-accent-600 p-2 text-accent-50">
          <IconComponent
            size="2xl"
            icon={ChestIcon}
            label="Treasure chest"
          />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-fg">
            {vault?.name || "Untitled Vault"}
          </h1>
          <p className="text-xs uppercase tracking-wide text-muted-fg">
            Vault overview
          </p>
        </div>
      </div>

      {/* Placeholder for future actions */}
      <div className="flex items-center gap-2">
        {/* Example future slot */}
        {vaultId ? <CreateMenu vaultId={vaultId} /> : null}
      </div>
    </Card>
  );
}
