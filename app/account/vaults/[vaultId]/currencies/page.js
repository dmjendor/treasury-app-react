import CurrenciesClient from "@/app/_components/CurrenciesClient";

export default async function Page({ params }) {
  const { vaultId } = await params;
  return <CurrenciesClient vaultId={vaultId} />;
}
