// app/_components/SplitHoldingsFormClient.js
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/app/_components/Button";
import InputComponent from "@/app/_components/InputComponent";
import { LinkButton } from "@/app/_components/LinkButton";
import { splitVaultHoldingsAction } from "@/app/_lib/actions/holdings";
import { useGlobalUI } from "@/app/_context/GlobalUIProvider";
import { useVault } from "@/app/_context/VaultProvider";
import { normalizeCode } from "@/app/utils/currencyUtils";
import Section from "@/app/_components/Section";

function formatAmount(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString() : "0";
}

function Toggle({ id, checked, onChange, label, hint }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-border bg-input px-4 py-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-accent-500"
      />
      <div>
        <div className="text-sm text-fg">{label}</div>
        {hint ? <div className="text-xs text-muted-fg">{hint}</div> : null}
      </div>
    </label>
  );
}

/**
 * Render the split holdings form.
 * @param {{ vaultId: string, balances: Array<{currency_id:string,name:string,code?:string,total_value:number}>, currencies: Array<{id:string,name?:string,code?:string,rate?:number}>, defaultMemberCount: number, mergeSplit: boolean, treasurySplitEnabled?: boolean, isModal?: boolean }} props
 * @returns {JSX.Element}
 */
export default function SplitHoldingsFormClient({
  vaultId,
  balances,
  currencies,
  defaultMemberCount,
  mergeSplit,
  treasurySplitEnabled = true,
  isModal,
}) {
  const router = useRouter();
  const { toggleSpinner } = useGlobalUI();
  const { invalidateHoldings } = useVault();
  const [memberCount, setMemberCount] = useState(
    Number.isFinite(Number(defaultMemberCount))
      ? String(defaultMemberCount)
      : "0",
  );
  const [includeOwner, setIncludeOwner] = useState(false);
  const [includePartyShare, setIncludePartyShare] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [splitResult, setSplitResult] = useState(null);

  const balanceList = Array.isArray(balances) ? balances : [];
  const hasHoldings = balanceList.some(
    (balance) => Number(balance.total_value) > 0,
  );

  const currencyMap = useMemo(() => {
    return new Map(
      (Array.isArray(currencies) ? currencies : []).map((currency) => [
        String(currency.id),
        currency,
      ]),
    );
  }, [currencies]);

  const effectiveMemberCount = useMemo(() => {
    const count = Number(memberCount);
    const base = Number.isFinite(count) ? count : 0;
    return base + (includeOwner ? 1 : 0);
  }, [memberCount, includeOwner]);

  const shareCount = effectiveMemberCount + (includePartyShare ? 1 : 0);

  const splitRows = Array.isArray(splitResult?.byCurrency)
    ? splitResult.byCurrency
    : [];

  function close() {
    if (!vaultId) return;
    if (isModal) {
      router.back();
      return;
    }
    router.replace(`/account/vaults/${vaultId}/holdings`);
  }

  async function handleSplit(e) {
    e.preventDefault();
    setError("");

    if (!vaultId) {
      setError("Missing vault id.");
      return;
    }

    const count = Number(memberCount);
    if (!Number.isInteger(count) || count < 0) {
      setError("Party member count must be a whole number.");
      return;
    }

    const effectiveCount = count + (includeOwner ? 1 : 0);
    if (!Number.isInteger(effectiveCount) || effectiveCount <= 0) {
      setError("Party member count must be at least 1.");
      return;
    }

    if (!hasHoldings) {
      setError("No holdings are available to split.");
      return;
    }

    setBusy(true);
    toggleSpinner(true, "Splitting");

    const res = await splitVaultHoldingsAction({
      vaultId,
      partyMemberCount: effectiveCount,
      keepPartyShare: includePartyShare,
      mergeSplit,
    });

    toggleSpinner(false);
    setBusy(false);

    if (!res?.ok) {
      setError(res?.error || "Split failed.");
      return;
    }

    setSplitResult(res.data || {});
    invalidateHoldings();
    toast.success("Holdings split completed.");
  }

  if (splitResult) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-fg space-y-2">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {!isModal && (
              <h1 className="text-2xl font-semibold">Split holdings</h1>
            )}
            <p className="text-sm text-muted-fg">
              Split complete. Review the per-player payout below.
            </p>
          </div>
          {!isModal && vaultId ? (
            <LinkButton
              href={`/account/vaults/${vaultId}/holdings`}
              variant="outline"
            >
              Back
            </LinkButton>
          ) : null}
        </header>

        <Section>
          <div className="text-sm font-semibold text-fg">Split results</div>
          {splitRows.length === 0 ? (
            <div className="text-sm text-muted-fg">
              No currency payouts were generated.
            </div>
          ) : (
            <div className="gap-3">
              {splitRows.map((row) => {
                const currency = currencyMap.get(String(row.currency_id));
                const code = currency?.code ? normalizeCode(currency.code) : "";
                const label = currency?.name || "Currency";
                return (
                  <div
                    key={row.currency_id}
                    className="rounded-xl border border-border bg-primary-600 px-4 py-3 text-primary-50"
                  >
                    <div className="text-xs text-primary-200">{label}</div>
                    <div className="mt-1 text-lg font-semibold">
                      {formatAmount(row.share_amount)} {code || ""}
                    </div>
                    <div className="text-xs text-primary-200">
                      Per player share
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            variant="primary"
            onClick={close}
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-fg space-y-2">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {!isModal && (
            <h1 className="text-2xl font-semibold">Split holdings</h1>
          )}
          <p className="text-sm text-muted-fg">
            Review totals and split across party members.
          </p>
        </div>
        {!isModal && vaultId ? (
          <LinkButton
            href={`/account/vaults/${vaultId}/holdings`}
            variant="outline"
          >
            Back
          </LinkButton>
        ) : null}
      </header>

      {!treasurySplitEnabled ? (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-fg">
          Treasury splitting is currently disabled for this vault.
        </div>
      ) : null}

      <Section>
        <div className="font-semibold text-fg">Current totals</div>
        {balanceList.length === 0 ? (
          <div className="text-sm text-muted-fg">No holdings yet.</div>
        ) : (
          <div className="grid gap-3 sm:grid-flow-col sm:auto-cols-fr">
            {balanceList.map((balance) => {
              const code = balance.code ? normalizeCode(balance.code) : "";
              return (
                <div
                  key={balance.currency_id}
                  className="rounded-xl border border-border bg-primary-600 px-4 py-3 text-primary-50"
                >
                  <div className="text-xs text-primary-200">
                    {balance.name || "Currency"}
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {formatAmount(balance.total_value)} {code || ""}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="font-semibold text-fg">Split settings</div>
          <div className="mt-2 text-xs text-muted-fg text-right">
            Split method:{" "}
            <span
              className="font-semibold text-fg"
              title={
                mergeSplit
                  ? "Holding balances are first converted into the base currency, then split evenly, with each share redistributed into the highest possible denomination and any remaining value carried down into lower denominations."
                  : "Holdings are split for each currency, with remainders remaining in the party pool."
              }
            >
              {mergeSplit ? "Merge to base currency" : "Per-currency"}
            </span>
          </div>
        </div>
        <form
          onSubmit={handleSplit}
          className="space-y-4"
        >
          <InputComponent
            label="Party members"
            hint="Defaults to members with view access. Edit to include offline players."
            inputMode="numeric"
            type="number"
            min={0}
            step={1}
            value={memberCount}
            onChange={(e) => setMemberCount(e.target.value)}
            disabled={busy || !treasurySplitEnabled}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              id="include-owner"
              checked={includeOwner}
              onChange={(e) => setIncludeOwner(e.target.checked)}
              label="Include the treasury owner"
              hint="Adds the GM to the split when they are also a player."
            />

            <Toggle
              id="include-party-share"
              checked={includePartyShare}
              onChange={(e) => setIncludePartyShare(e.target.checked)}
              label="Include a party share"
              hint="Keeps one extra share in the treasury after splitting."
            />
          </div>

          <div className="rounded-xl border border-border bg-primary-600 px-4 py-3 text-sm text-primary-100">
            Total shares:{" "}
            <span className="font-semibold">{formatAmount(shareCount)}</span>{" "}
            {includePartyShare ? "(including party share)" : " "}
          </div>

          {error ? (
            <div className="rounded-lg border border-danger-800 bg-primary-600 p-4">
              <p className="text-danger-200 text-sm">{error}</p>
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={close}
            >
              Close
            </Button>
            {!splitResult ? (
              <Button
                type="submit"
                variant="primary"
                disabled={busy || !treasurySplitEnabled}
              >
                {busy ? "Splitting..." : "Perform split"}
              </Button>
            ) : null}
          </div>
        </form>
      </Section>
    </div>
  );
}
