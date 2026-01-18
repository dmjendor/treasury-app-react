// app/_components/TreasureFormWithVault.js
"use client";

import TreasureForm from "@/app/_components/TreasuresForm";
import { useVault } from "@/app/_context/VaultProvider";

export default function TreasuresFormWithVault({
  mode,
  treasureId,
  onClose,
  onSaved,
}) {
  const { vault, updateVault } = useVault();

  return (
    <TreasureForm
      mode={mode}
      vault={vault}
      updateVault={updateVault}
      treasureId={treasureId}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}
