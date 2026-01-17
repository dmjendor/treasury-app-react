"use client";

import { useParams, useRouter } from "next/navigation";
import CurrencyFormWithVault from "@/app/_components/CurrencyFormWithVault";

export default function Page({ params }) {
  const router = useRouter();
  const { vaultId, currencyId } = useParams();

  function handleClose() {
    router.replace(`/account/vaults/${vaultId}/currencies`);
    router.refresh();
  }

  return (
    <CurrencyFormWithVault
      mode="edit"
      currencyId={currencyId}
      onClose={handleClose}
    />
  );
}
