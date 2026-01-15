import CurrencyFormModal from "@/app/_components/CurrencyForm";
import React from "react";

export default async function Page({ params }) {
  const { vaultId } = await params;
  return (
    <CurrencyFormModal
      mode="create"
      vaultId={vaultId}
    />
  );
}
