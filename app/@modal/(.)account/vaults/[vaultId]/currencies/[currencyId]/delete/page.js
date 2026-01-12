import DeleteCurrencyModal from "@/app/_components/DeleteCurrencyModal";

/**
 *
 * - Render the delete currency modal page.
 * - @param {{ params: Promise<{ vaultId: string, currencyId: string }> }} props
 * - @returns {Promise<JSX.Element>}
 */
export default async function Page({ params }) {
  const { vaultId, currencyId } = await params;

  return (
    <DeleteCurrencyModal vaultId={vaultId} currencyId={currencyId} />
  );
}
