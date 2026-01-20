"use client";
import Modal from "@/app/_components/Modal";
import ValuablesFormWithVault from "@/app/_components/ValuablesFormWithVault";
import { useVault } from "@/app/_context/VaultProvider";
import { getDefaultValuablesAction } from "@/app/_lib/actions/valuables";
import { useEffect, useState } from "react";

/**
- Render the new valuable modal.
- @returns {Promise<JSX.Element>}
  */
export default function Page() {
  const { vault } = useVault();
  const [defaultValuables, setDefaultValuables] = useState([]);
  const vaultId = vault?.id;
  useEffect(() => {
    if (!vaultId) return;

    async function load() {
      const res = await getDefaultValuablesAction({ vaultId });

      if (!res.ok) {
        setDefaultValuables([]);
        return;
      }

      setDefaultValuables(Array.isArray(res.data) ? res.data : []);
    }

    load();
  }, [vaultId]);

  return (
    <Modal title="Add Valuable">
      <ValuablesFormWithVault
        mode="create"
        defaultValuables={defaultValuables}
      />
    </Modal>
  );
}
