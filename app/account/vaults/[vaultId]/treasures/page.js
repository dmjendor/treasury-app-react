import TreasuresClient from "./TreasuresClient";
import { getContainersForVault } from "@/app/_lib/data/containers.data";
import { getTreasuresForVault } from "@/app/_lib/data/treasures.data";

export default async function Page({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const { vaultId } = resolvedParams;

  const [containers, treasures] = await Promise.all([
    getContainersForVault(vaultId),
    getTreasuresForVault(vaultId),
  ]);

  return (
    <TreasuresClient
      vaultId={vaultId}
      containers={Array.isArray(containers) ? containers : []}
      treasures={Array.isArray(treasures) ? treasures : []}
    />
  );
}
