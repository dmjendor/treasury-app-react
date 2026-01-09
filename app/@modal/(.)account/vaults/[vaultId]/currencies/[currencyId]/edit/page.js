"use client";

import CurrencyFormModal from "@/app/_components/CurrencyFormModal";

export default function Page({ params }) {
  return (
    <CurrencyFormModal
      mode="edit"
      vaultId={params.vaultId}
      currencyId={params.currencyId}
    />
  );
}
