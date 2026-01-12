import NewTreasuresClient from "./NewTreasuresClient";
import { getContainersForVault } from "@/app/_lib/data/containers.data";
import {
  getTreasuresForVault,
  getDefaultTreasures,
} from "@/app/_lib/data/treasures.data";

export default async function Page({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const { vaultId } = resolvedParams;

  const [containers, treasures, defaultTreasures] = await Promise.all([
    getContainersForVault(vaultId),
    getTreasuresForVault(vaultId),
    getDefaultTreasures(vaultId, editionId),
  ]);

  return (
    <NewTreasuresClient
      vaultId={vaultId}
      containers={Array.isArray(containers) ? containers : []}
      treasures={Array.isArray(treasures) ? treasures : []}
      defaultTreasures={Array.isArray(defaultTreasures) ? defaultTreasures : []}
    />
  );
}
