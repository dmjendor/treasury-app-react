// app/account/vaults/[vaultId]/currencies/[currencyId]/delete/page.js

import CurrencyDeleteClient from "@/app/_components/CurrencyDeleteClient";

export default async function Page({ params }) {
  const { vaultId, currencyId } = await params;
  return (
    <CurrencyDeleteClient
      vaultId={vaultId}
      currencyId={currencyId}
    />
  );
}
