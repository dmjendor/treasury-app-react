// app/demo/DemoSplitHoldingsModal.js
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/app/_components/Button";
import InputComponent from "@/app/_components/InputComponent";
import Section from "@/app/_components/Section";
import { normalizeCode } from "@/app/utils/currencyUtils";

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
 * Render the demo split holdings modal.
 * @param {{ open: boolean, balances: Array<{currency_id:string,name?:string,code?:string,total_value:number}>, currencies: Array<{id:string,name?:string,code?:string,rate?:number}>, onClose: () => void, onApply?: (payload: { remaining: Array<{currency_id:string,total_value:number}>, splitResult: { byCurrency: Array<{currency_id:string,share_amount:number}> } }) => void }} props
 * @returns {JSX.Element | null}
 */
export default function DemoSplitHoldingsModal({
  open,
  balances,
  currencies,
  onClose,
  onApply,
}) {
  const [memberCount, setMemberCount] = useState("4");
  const [includeOwner, setIncludeOwner] = useState(false);
  const [includePartyShare, setIncludePartyShare] = useState(false);
  const [error, setError] = useState("");
  const [splitResult, setSplitResult] = useState(null);

  const balanceList = Array.isArray(balances) ? balances : [];
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

  function reset() {
    setSplitResult(null);
    setError("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSplit(event) {
    event.preventDefault();
    setError("");

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

    if (!balanceList.some((balance) => Number(balance.total_value) > 0)) {
      setError("No holdings are available to split.");
      return;
    }

    const results = balanceList.map((balance) => {
      const total = Number(balance.total_value) || 0;
      const shareAmount = Math.floor(total / shareCount);
      const remainder = total - shareAmount * shareCount;
      const remaining =
        remainder + (includePartyShare ? shareAmount : 0);
      return {
        currency_id: balance.currency_id,
        share_amount: shareAmount,
        remaining,
      };
    });

    const splitResultPayload = {
      byCurrency: results.map((row) => ({
        currency_id: row.currency_id,
        share_amount: row.share_amount,
      })),
    };

    const remainingBalances = results.map((row) => ({
      currency_id: row.currency_id,
      total_value: row.remaining,
    }));

    setSplitResult(splitResultPayload);

    if (typeof onApply === "function") {
      onApply({
        remaining: remainingBalances,
        splitResult: splitResultPayload,
      });
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-overlay text-fg">
      <button
        type="button"
        aria-label="Close modal"
        onClick={handleClose}
        className="absolute inset-0 bg-overlay"
      />

      <div className="relative flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-xl">
          <div className="flex items-start justify-between gap-4 border-b border-border bg-primary-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-primary-50">
              Split Holdings (Demo)
            </h2>
            <Button
              variant="accent"
              onClick={handleClose}
              className="rounded-lg border border-border text-btn-secondary-fg px-3 py-2 text-sm"
            >
              X
            </Button>
          </div>

          <div className="p-6 space-y-4">
            {splitResult ? (
              <Section>
                <div className="text-sm font-semibold text-fg">
                  Split results
                </div>
                {splitResult.byCurrency.length === 0 ? (
                  <div className="text-sm text-muted-fg">
                    No currency payouts were generated.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {splitResult.byCurrency.map((row) => {
                      const currency = currencyMap.get(String(row.currency_id));
                      const code = currency?.code
                        ? normalizeCode(currency.code)
                        : "";
                      const label = currency?.name || "Currency";
                      return (
                        <div
                          key={row.currency_id}
                          className="rounded-xl border border-border bg-primary-600 px-4 py-3 text-primary-50"
                        >
                          <div className="text-xs text-primary-200">
                            {label}
                          </div>
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

                <div className="flex justify-end pt-3">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleClose}
                  >
                    Close
                  </Button>
                </div>
              </Section>
            ) : (
              <>
                <Section>
                  <div className="font-semibold text-fg">Current totals</div>
                  {balanceList.length === 0 ? (
                    <div className="text-sm text-muted-fg">
                      No holdings yet.
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-flow-col sm:auto-cols-fr">
                      {balanceList.map((balance) => {
                        const code = balance.code
                          ? normalizeCode(balance.code)
                          : "";
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
                  <form
                    onSubmit={handleSplit}
                    className="space-y-4"
                  >
                    <InputComponent
                      label="Party members"
                      hint="Demo split only affects the local preview."
                      inputMode="numeric"
                      type="number"
                      min={0}
                      step={1}
                      value={memberCount}
                      onChange={(e) => setMemberCount(e.target.value)}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Toggle
                        id="demo-include-owner"
                        checked={includeOwner}
                        onChange={(e) => setIncludeOwner(e.target.checked)}
                        label="Include the treasury owner"
                        hint="Adds the GM to the split when they are also a player."
                      />

                      <Toggle
                        id="demo-include-party-share"
                        checked={includePartyShare}
                        onChange={(e) => setIncludePartyShare(e.target.checked)}
                        label="Include a party share"
                        hint="Keeps one extra share in the treasury after splitting."
                      />
                    </div>

                    <div className="rounded-xl border border-border bg-primary-600 px-4 py-3 text-sm text-primary-100">
                      Total shares:{" "}
                      <span className="font-semibold">
                        {formatAmount(shareCount)}
                      </span>{" "}
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
                        onClick={handleClose}
                      >
                        Close
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                      >
                        Perform split
                      </Button>
                    </div>
                  </form>
                </Section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
