import ContainerList from "@/app/_components/ContainerList";
import { getContainersForVault } from "@/app/_lib/data-service";

export default async function ContainersPage({ params }) {
  const { vaultId } = await params;

  const containers = await getContainersForVault(vaultId);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink-900">Containers</h2>
          <p className="mt-1 text-sm text-ink-600">
            Organize loot into bags, chests, and stashes.
          </p>
        </div>

        <a
          href={`/account/vaults/${encodeURIComponent(vaultId)}/containers/new`}
          className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
        >
          New container
        </a>
      </div>

      <ContainerList
        containers={containers}
        vaultId={vaultId}
      />
    </div>
  );
}
