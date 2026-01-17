// app/_components/CurrencyFormWithVault.js
"use client";

import CurrencyForm from "@/app/_components/CurrencyForm";
import { useVault } from "@/app/_context/VaultProvider";

/**
- Render the currency form with vault context.
- @param {{ mode: "create" | "edit", currencyId?: string, onClose?: () => void, onSaved?: (savedCurrency: any) => void }} props
- @returns {JSX.Element}
 */
export default function CurrencyFormWithVault({
  mode,
  currencyId,
  onClose,
  onSaved,
}) {
  const { vault, updateVault } = useVault();

  return (
    <CurrencyForm
      mode={mode}
      vault={vault}
      updateVault={updateVault}
      currencyId={currencyId}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}
