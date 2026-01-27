// app/account/vaults/[vaultId]/holdings/page.js
import HoldingsTableClient from "@/app/account/vaults/[vaultId]/holdings/HoldingsTableClient";
import { getCurrenciesForVault } from "@/app/_lib/data/currencies.data";
import {
  getVaultCurrencyBalances,
  listUnarchivedHoldingsEntries,
} from "@/app/_lib/data/holdings.data";
import { getRouteParams } from "@/app/_lib/routing/params";
import { getSearchParams } from "@/app/_lib/routing/searchParams";
import { normalizeCode } from "@/app/utils/currencyUtils";

function clampPage(n) {
  const x = Number(n);
  return Number.isFinite(x) && x > 0 ? x : 1;
}

function parsePageSize(n) {
  const x = Number(n);
  return [20, 50, 100].includes(x) ? x : 20;
}

function safeRate(value) {
  const rate = Number(value);
  return Number.isFinite(rate) ? rate : Number.POSITIVE_INFINITY;
}

function formatAmount(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString() : "0";
}

/**
 * Render the vault holdings page.
 * @param {{ params: Promise<Record<string,string>> | Record<string,string>, searchParams: Promise<Record<string,string>> | Record<string,string> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function HoldingsPage({ params, searchParams }) {
  const { vaultId } = await getRouteParams(params);
  const { pageData, pageSizeData } = await getSearchParams(searchParams);
  const page = clampPage(pageData);
  const pageSize = parsePageSize(pageSizeData);

  let balances = [];
  let entries = [];
  let currencies = [];
  let loadError = "";

  try {
    [balances, entries, currencies] = await Promise.all([
      getVaultCurrencyBalances(vaultId),
      listUnarchivedHoldingsEntries(vaultId),
      getCurrenciesForVault(vaultId),
    ]);
  } catch (e) {
    loadError = e?.message || "Could not load holdings.";
  }

  const currencyMap = new Map(
    (Array.isArray(currencies) ? currencies : []).map((currency) => [
      String(currency.id),
      currency,
    ]),
  );

  const balanceMap = new Map(
    (Array.isArray(balances) ? balances : []).map((balance) => [
      String(balance.currency_id),
      balance,
    ]),
  );

  const sortedCurrencies = [...(currencies || [])].sort(
    (a, b) => safeRate(a.rate) - safeRate(b.rate),
  );

  const cards = sortedCurrencies.map((currency) => {
    const balance = balanceMap.get(String(currency.id));
    const code = currency.code ? normalizeCode(currency.code) : "";
    return {
      id: currency.id,
      name: currency.name || "Currency",
      code,
      rate: currency.rate,
      total: balance?.total_value ?? 0,
    };
  });

  const total = Array.isArray(entries) ? entries.length : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageEntries = (entries || []).slice(startIndex, endIndex);

  const rows = pageEntries.map((entry) => {
    const currency = currencyMap.get(String(entry.currency_id));
    const code = currency?.code ? normalizeCode(currency.code) : "";
    const currencyLabel = code || currency?.name || "Unknown currency";

    return {
      id: entry.id,
      value: entry.value,
      timestamp: entry.timestamp,
      currencyLabel,
    };
  });

  const basePath = `/account/vaults/${vaultId}/holdings`;

  return (
    <div className="px-6 py-6 text-fg space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Holdings</h1>
          <p className="text-sm text-muted-fg">
            Showing {rows.length} of {total} entries.
          </p>
        </div>
      </header>

      {!loadError ? (
        cards.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-fg">
            No currencies yet. Add a currency to start tracking holdings.
          </div>
        ) : (
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="rounded-2xl border border-border bg-primary-600 p-4 text-primary-50"
              >
                <div className="text-xs text-primary-200">
                  {card.code || card.name}
                </div>
                <div className="mt-1 text-2xl font-semibold">
                  {formatAmount(card.total)}
                </div>
                <div className="mt-1 text-xs text-primary-200">
                  Rate {Number.isFinite(Number(card.rate)) ? card.rate : "--"}
                </div>
              </div>
            ))}
          </section>
        )
      ) : null}

      {loadError ? (
        <div className="rounded-lg border border-danger-800 bg-primary-600 p-4">
          <p className="text-danger-200 text-sm">
            Could not load holdings: {loadError}
          </p>
        </div>
      ) : null}

      <HoldingsTableClient
        vaultId={String(vaultId)}
        basePath={basePath}
        rows={rows}
        pageSize={pageSize}
        total={total}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
