"use client";
import CurrencyForm from "@/app/_components/CurrencyForm";

import { useVault } from "@/app/_context/VaultProvider";
import { useParams } from "next/navigation";
import React from "react";

export default function Page() {
  const params = useParams();
  const currencyId = params?.currencyId ? String(params.currencyId) : "";

  const vault = useVault();

  return (
    <CurrencyForm
      mode="edit"
      vault={vault}
      currencyId={currencyId}
    />
  );
}
