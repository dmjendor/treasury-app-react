"use client";

import CurrencyFormModal from "@/app/_components/CurrencyFormModal";
import React from "react";

export default function Page({ params }) {
  const vaultId = React.use(params, "vaultId");
  return (
    <CurrencyFormModal
      mode="create"
      vaultId={vaultId}
    />
  );
}
