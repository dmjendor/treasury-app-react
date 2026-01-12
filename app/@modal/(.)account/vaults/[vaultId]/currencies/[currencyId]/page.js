import Link from "next/link";
import { notFound } from "next/navigation";

import { normalizeCode, formatRate } from "@/app/utils/currencyUtils";
import {
  getCurrenciesForVault,
  getCurrencyForVaultById,
} from "@/app/_lib/data/currencies.data";

export default async function Page({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;

  const { vaultId, currencyId } = resolvedParams;
  if (!vaultId || !currencyId) return notFound();

  const [currency, allCurrencies] = await Promise.all([
    getCurrencyForVaultById(vaultId, currencyId),
    getCurrenciesForVault(vaultId),
  ]);

  if (!currency) return notFound();

  const baseCurrency = Array.isArray(allCurrencies)
    ? allCurrencies.find((c) => Number(c.rate) === 1)
    : null;

  const isBase = Number(currency.rate) === 1;

  const currencyCode = normalizeCode(currency.code);
  const baseCode = baseCurrency ? normalizeCode(baseCurrency.code) : null;

  const rateNum = Number(currency.rate);
  const canInvert = Number.isFinite(rateNum) && rateNum > 0;

  const valueToBase =
    !isBase && baseCurrency
      ? `1 ${currencyCode} = ${formatRate(currency.rate)} ${baseCode}`
      : null;

  const valueFromBase =
    !isBase && baseCurrency && canInvert
      ? `1 ${baseCode} = ${formatRate(1 / rateNum)} ${currencyCode}`
      : null;

  return (
    <div className="p-6 max-w-xl mx-auto text-(--fg)">
      <div className="rounded-2xl border border-(--border) bg-(--card) text-(--card-fg) overflow-hidden">
        {/* Strong header so the theme shows */}
        <div className="px-5 py-4 bg-(--primary-700) text-(--primary-50) border-b border-(--border)">
          <h1 className="text-xl font-semibold">{currency.name}</h1>
          <p className="text-sm opacity-90">{currencyCode}</p>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-(--muted-fg)">Rate</div>
            <div>{formatRate(currency.rate)}</div>

            <div className="text-(--muted-fg)">Base currency</div>
            <div>{isBase ? "Yes" : "No"}</div>

            <div className="text-(--muted-fg)">Relative to base</div>
            <div className="space-y-1">
              {baseCurrency ? (
                isBase ? (
                  <div>{`This is the base (${baseCode})`}</div>
                ) : (
                  <>
                    {valueToBase ? <div>{valueToBase}</div> : null}
                    {valueFromBase ? (
                      <div className="text-(--muted-fg)">{valueFromBase}</div>
                    ) : null}
                  </>
                )
              ) : (
                <div className="text-(--muted-fg)">No base currency set</div>
              )}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <Link
              href={`/account/vaults/${vaultId}/currencies/${currencyId}/edit`}
              className="
                px-3 py-2 rounded-lg
                bg-(--primary-700) text-(--primary-50)
                hover:bg-(--primary-600)
                border border-(--border)
                transition-colors
              "
            >
              Edit
            </Link>

            {!isBase && (
              <Link
                href={`/account/vaults/${vaultId}/currencies/${currencyId}/delete`}
                className="
                  px-3 py-2 rounded-lg
                  bg-(--danger-700) text-(--danger-50)
                  hover:bg-(--danger-600)
                  border border-(--border)
                  transition-colors
                "
              >
                Delete
              </Link>
            )}

            <Link
              href={`/account/vaults/${vaultId}/currencies`}
              className="
                ml-auto px-3 py-2 rounded-lg
                border border-(--border)
                bg-(--accent-700) text-(--accent-50)
                hover:bg-(--accent-600)
                transition-colors
              "
            >
              Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
