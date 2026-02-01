// app/_components/ValuableFormWithVault.js
"use client";

import ValuablesForm from "@/app/_components/ValuablesForm";
import { useVault } from "@/app/_context/VaultProvider";

export default function ValuablesFormWithVault({
  mode,
  valuableId,
  onClose,
  onSaved,
}) {
  const { vault, updateVault } = useVault();

  return (
    <ValuablesForm
      mode={mode}
      vault={vault}
      updateVault={updateVault}
      valuableId={valuableId}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}
