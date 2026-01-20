import ValuablesClient from "./ValuablesClient";
import { getContainersForVault } from "@/app/_lib/data/containers.data";
import { getValuablesForVault } from "@/app/_lib/data/valuables.data";

export default async function Page({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const { vaultId } = resolvedParams;

  const [containers, valuables] = await Promise.all([
    getContainersForVault(vaultId),
    getValuablesForVault(vaultId),
  ]);

  return (
    <ValuablesClient
      vaultId={vaultId}
      containers={Array.isArray(containers) ? containers : []}
      valuables={Array.isArray(valuables) ? valuables : []}
    />
  );
}
