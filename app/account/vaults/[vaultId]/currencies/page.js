import CurrenciesClient from "./CurrenciesClient";

export default async function Page({ params }) {
  const { vaultId } = await params;
  return <CurrenciesClient vaultId={vaultId} />;
}
