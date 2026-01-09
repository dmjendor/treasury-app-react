"use client";

import DeleteCurrencyModal from "@/app/_components/DeleteCurrencyModal";

export default function Page({ params }) {
  return (
    <DeleteCurrencyModal
      vaultId={params.vaultId}
      currencyId={params.currencyId}
    />
  );
}
