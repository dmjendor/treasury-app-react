import noStore from "next/cache";
import { getVaults } from "../_lib/data-service";
import VaultCard from "./VaultCard";

async function VaultList() {
  // noStore();
  const vaults = await getVaults();

  if (!vaults.length) return null;

  return (
    <>
      {vaults.length > 0 && (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 xl:gap-14">
          {vaults.map((vault) => (
            <VaultCard
              vault={vault}
              key={vault.id}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default VaultList;
