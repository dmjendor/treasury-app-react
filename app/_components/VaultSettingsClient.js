"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useVault } from "@/app/_context/VaultProvider";
import InputComponent from "@/app/_components/InputComponent";
import Select from "@/app/_components/Select";
import { Button } from "@/app/_components/Button";
import { LinkButton } from "@/app/_components/LinkButton";
import { updateVaultSettingsAction } from "@/app/_lib/actions/vaults";

function toNumberOrNull(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function VaultSettingsClient() {
  const router = useRouter();
  const { vault, updateVault } = useVault();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Local form state
  const [name, setName] = useState(vault.name ?? "");
  const [active, setActive] = useState(!!vault.active);

  const [themeId, setThemeId] = useState(vault.theme_id ?? "");
  const [systemId, setSystemId] = useState(vault.system_id ?? "");

  const [allowXferIn, setAllowXferIn] = useState(!!vault.allow_xfer_in);
  const [allowXferOut, setAllowXferOut] = useState(!!vault.allow_xfer_out);

  const [baseCurrencyId, setBaseCurrencyId] = useState(
    vault.base_currency_id ?? ""
  );
  const [commonCurrencyId, setCommonCurrencyId] = useState(
    vault.common_currency_id ?? ""
  );

  const [treasurySplitEnabled, setTreasurySplitEnabled] = useState(
    !!vault.treasury_split_enabled
  );
  const [rewardPrepEnabled, setRewardPrepEnabled] = useState(
    !!vault.reward_prep_enabled
  );

  const [voBuyMarkup, setVoBuyMarkup] = useState(
    vault.vo_buy_markup != null ? String(vault.vo_buy_markup) : ""
  );
  const [voSellMarkup, setVoSellMarkup] = useState(
    vault.vo_sell_markup != null ? String(vault.vo_sell_markup) : ""
  );
  const [itemBuyMarkup, setItemBuyMarkup] = useState(
    vault.item_buy_markup != null ? String(vault.item_buy_markup) : ""
  );
  const [itemSellMarkup, setItemSellMarkup] = useState(
    vault.item_sell_markup != null ? String(vault.item_sell_markup) : ""
  );

  const [mergeSplit, setMergeSplit] = useState(vault.merge_split ?? "");

  // These lists need to come from somewhere.
  // Best place: fetch them in the vault layout and include them in the provider value.
  console.log(vault);
  const themes = useMemo(() => vault.themeList ?? [], [vault]);
  const systems = useMemo(() => vault.systemList ?? [], [vault]);
  const currencies = useMemo(() => vault.currencyList ?? [], [vault]);

  if (!vault) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-fg">
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-fg">
          Loading vault…
        </div>
      </div>
    );
  }

  async function onSave(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Vault name is required.");
      return;
    }

    setBusy(true);

    const payload = {
      id: vault.id,
      name: name.trim(),
      active,

      theme_id: themeId || null,
      system_id: systemId || null,

      allow_xfer_in: allowXferIn,
      allow_xfer_out: allowXferOut,

      base_currency_id: baseCurrencyId || null,
      common_currency_id: commonCurrencyId || null,

      treasury_split_enabled: treasurySplitEnabled,
      reward_prep_enabled: rewardPrepEnabled,

      vo_buy_markup: toNumberOrNull(voBuyMarkup),
      vo_sell_markup: toNumberOrNull(voSellMarkup),
      item_buy_markup: toNumberOrNull(itemBuyMarkup),
      item_sell_markup: toNumberOrNull(itemSellMarkup),

      merge_split: mergeSplit || null,
    };

    const res = await updateVaultSettingsAction(payload);

    if (!res?.ok) {
      setError(res?.error || "Failed to save settings.");
      setBusy(false);
      return;
    }

    // Update context with DB-returned values (source of truth)
    updateVault(res.data);

    router.refresh();
    setBusy(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto text-fg space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Vault settings</h1>
          <p className="text-sm text-muted-fg">
            Configure vault behavior and theme.
          </p>
        </div>

        <LinkButton
          href={`/account/vaults/${vault.id}`}
          variant="outline"
        >
          Back
        </LinkButton>
      </header>

      <form
        onSubmit={onSave}
        className="rounded-2xl border border-border bg-card text-card-fg p-5 space-y-6"
      >
        {error ? (
          <div className="rounded-xl border border-danger-600 bg-danger-100 p-3 text-sm text-danger-700">
            {error}
          </div>
        ) : null}

        <section className="space-y-4">
          <div className="text-sm font-semibold text-fg">Basics</div>

          <InputComponent
            id="name"
            type="text"
            label="Vault name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <InputComponent
            id="active"
            type="checkbox"
            label="Active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />

          <Select
            id="theme_id"
            label="Theme"
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
          >
            <option value="">Default</option>
            {themes.map((t) => (
              <option
                key={t.id}
                value={t.id}
              >
                {t.name}
              </option>
            ))}
          </Select>

          <Select
            id="system_id"
            label="System"
            value={systemId}
            onChange={(e) => setSystemId(e.target.value)}
          >
            <option value="">Not set</option>
            {systems.map((ed) => (
              <option
                key={ed.id}
                value={ed.id}
              >
                {ed.name}
              </option>
            ))}
          </Select>
        </section>

        <section className="space-y-4">
          <div className="text-sm font-semibold text-fg">Transfers</div>

          <InputComponent
            id="allow_xfer_in"
            type="checkbox"
            label="Allow transfers in"
            checked={allowXferIn}
            onChange={(e) => setAllowXferIn(e.target.checked)}
          />

          <InputComponent
            id="allow_xfer_out"
            type="checkbox"
            label="Allow transfers out"
            checked={allowXferOut}
            onChange={(e) => setAllowXferOut(e.target.checked)}
          />
        </section>

        <section className="space-y-4">
          <div className="text-sm font-semibold text-fg">Currencies</div>

          <Select
            id="base_currency_id"
            label="Base currency"
            value={baseCurrencyId}
            onChange={(e) => setBaseCurrencyId(e.target.value)}
          >
            <option value="">Not set</option>
            {currencies.map((c) => (
              <option
                key={c.id}
                value={c.id}
              >
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            id="common_currency_id"
            label="Common currency"
            value={commonCurrencyId}
            onChange={(e) => setCommonCurrencyId(e.target.value)}
          >
            <option value="">Not set</option>
            {currencies.map((c) => (
              <option
                key={c.id}
                value={c.id}
              >
                {c.name}
              </option>
            ))}
          </Select>
        </section>

        <section className="space-y-4">
          <div className="text-sm font-semibold text-fg">Workflow</div>

          <InputComponent
            id="treasury_split_enabled"
            type="checkbox"
            label="Enable treasury splitting"
            checked={treasurySplitEnabled}
            onChange={(e) => setTreasurySplitEnabled(e.target.checked)}
          />

          <InputComponent
            id="reward_prep_enabled"
            type="checkbox"
            label="Enable reward prep"
            checked={rewardPrepEnabled}
            onChange={(e) => setRewardPrepEnabled(e.target.checked)}
          />
        </section>

        <section className="space-y-4">
          <div className="text-sm font-semibold text-fg">Markups</div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InputComponent
              id="vo_buy_markup"
              type="text"
              label="Valuable buy markup"
              hint="Example: 1.10 for +10%"
              value={voBuyMarkup}
              onChange={(e) => setVoBuyMarkup(e.target.value)}
            />
            <InputComponent
              id="vo_sell_markup"
              type="text"
              label="Valuable sell markup"
              hint="Example: 0.90 for -10%"
              value={voSellMarkup}
              onChange={(e) => setVoSellMarkup(e.target.value)}
            />
            <InputComponent
              id="item_buy_markup"
              type="text"
              label="Item buy markup"
              value={itemBuyMarkup}
              onChange={(e) => setItemBuyMarkup(e.target.value)}
            />
            <InputComponent
              id="item_sell_markup"
              type="text"
              label="Item sell markup"
              value={itemSellMarkup}
              onChange={(e) => setItemSellMarkup(e.target.value)}
            />
          </div>

          <InputComponent
            id="merge_split"
            type="text"
            label="Merge split"
            value={mergeSplit}
            onChange={(e) => setMergeSplit(e.target.value)}
          />
        </section>

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={busy}
          >
            {busy ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
