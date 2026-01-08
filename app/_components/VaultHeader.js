// app/account/vaults/[vaultId]/VaultHeader.jsx
import { HiOutlineBuildingLibrary } from "react-icons/hi2";
import CreateMenu from "./CreateMenu";

export default function VaultHeader({ vault }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary-500/15 p-2 text-primary-500">
          <HiOutlineBuildingLibrary className="h-6 w-6" />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-ink-900">
            {vault?.name || "Untitled Vault"}
          </h1>
          <p className="text-xs text-ink-600">Vault</p>
        </div>
      </div>

      {/* Placeholder for future actions */}
      <div className="flex items-center gap-2">
        {/* Example future slot */}
        <CreateMenu vaultId={vault.id} />
      </div>
    </div>
  );
}
