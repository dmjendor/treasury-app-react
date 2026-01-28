"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useVault } from "@/app/_context/VaultProvider";
import InputComponent from "@/app/_components/InputComponent";
import Select from "@/app/_components/Select";
import { Button } from "@/app/_components/Button";
import { LinkButton } from "@/app/_components/LinkButton";
import { updateVaultSettingsAction } from "@/app/_lib/actions/vaults";
import { addDefaultCurrenciesAction } from "@/app/_lib/actions/currencies";

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
  const [initialThemeId] = useState(vault.theme_id ?? "");
  const [systemId, setSystemId] = useState(vault.system_id ?? "");

  const [allowXferIn, setAllowXferIn] = useState(!!vault.allow_xfer_in);
  const [allowXferOut, setAllowXferOut] = useState(!!vault.allow_xfer_out);

  const [baseCurrencyId, setBaseCurrencyId] = useState(
    vault.base_currency_id ?? "",
  );
  const [commonCurrencyId, setCommonCurrencyId] = useState(
    vault.common_currency_id ?? "",
  );

  const [treasurySplitEnabled, setTreasurySplitEnabled] = useState(
    !!vault.treasury_split_enabled,
  );
  const [rewardPrepEnabled, setRewardPrepEnabled] = useState(
    !!vault.reward_prep_enabled,
  );

  const [voBuyMarkup, setVoBuyMarkup] = useState(
    vault.vo_buy_markup != null ? String(vault.vo_buy_markup) : "",
  );
  const [voSellMarkup, setVoSellMarkup] = useState(
    vault.vo_sell_markup != null ? String(vault.vo_sell_markup) : "",
  );
  const [itemBuyMarkup, setItemBuyMarkup] = useState(
    vault.item_buy_markup != null ? String(vault.item_buy_markup) : "",
  );
  const [itemSellMarkup, setItemSellMarkup] = useState(
    vault.item_sell_markup != null ? String(vault.item_sell_markup) : "",
  );

  const [mergeSplit, setMergeSplit] = useState(
    (vault.merge_split ?? "per_currency") === "base",
  );

  // These lists need to come from somewhere.
  // Best place: fetch them in the vault layout and include them in the provider value.
  const themes = useMemo(() => vault.themeList ?? [], [vault]);
  const systems = useMemo(() => vault.systemList ?? [], [vault]);
  const currencies = useMemo(() => vault.currencyList ?? [], [vault]);
  const themeKey = useMemo(() => {
    const selected = themes.find((t) => String(t.id) === String(themeId));
    const key = selected?.theme_key || vault?.theme?.theme_key || "night";
    return String(key).startsWith("theme-") ? String(key) : `theme-${key}`;
  }, [themes, themeId, vault]);
  const systemsByFamily = useMemo(() => {
    const map = new Map();
    for (const system of systems) {
      const family = system?.family ? String(system.family) : "Other";
      if (!map.has(family)) map.set(family, []);
      map.get(family).push(system);
    }
    for (const list of map.values()) {
      list.sort((a, b) =>
        String(a?.name || "").localeCompare(String(b?.name || "")),
      );
    }
    return new Map(
      [...map.entries()].sort((a, b) =>
        String(a[0] || "").localeCompare(String(b[0] || "")),
      ),
    );
  }, [systems]);

  if (!vault) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-fg">
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-fg">
          Loading vault...
        </div>
      </div>
    );
  }

  async function handleSystemChange(nextSystemId) {
    if (String(nextSystemId) === String(systemId || "")) return;
    setSystemId(nextSystemId);

    if (!nextSystemId) return;
    const selected = systems.find((s) => String(s.id) === String(nextSystemId));
    const defaultsRaw = selected?.default_currencies;
    if (!defaultsRaw) return;

    let defaults = defaultsRaw;
    if (typeof defaultsRaw === "string") {
      try {
        defaults = JSON.parse(defaultsRaw);
      } catch {
        defaults = null;
      }
    }

    if (!Array.isArray(defaults) || defaults.length === 0) return;

    const confirmMessage = `Add default currencies for ${
      selected?.name || "this system"
    }?`;
    const shouldAdd =
      typeof window !== "undefined" ? window.confirm(confirmMessage) : false;

    if (!shouldAdd) return;

    setBusy(true);
    setError("");

    const res = await addDefaultCurrenciesAction({
      vaultId: vault.id,
      defaults,
    });

    if (!res?.ok) {
      setError(res?.error || "Failed to add default currencies.");
      setBusy(false);
      return;
    }

    const created = Array.isArray(res?.data?.created) ? res.data.created : [];

    const nextCurrencyList = [...(vault.currencyList ?? []), ...created];
    const nextBase = res?.data?.baseCurrencyId;
    const nextCommon = res?.data?.commonCurrencyId;

    updateVault({
      ...vault,
      currencyList: nextCurrencyList,
      base_currency_id: nextBase || vault.base_currency_id,
      common_currency_id: nextCommon || vault.common_currency_id,
    });

    if (nextBase) setBaseCurrencyId(String(nextBase));
    if (nextCommon) setCommonCurrencyId(String(nextCommon));

    setBusy(false);
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

      merge_split: mergeSplit ? "base" : "per_currency",
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

  const themeChanged = String(themeId) !== String(initialThemeId);

  return (
    <div className={`${themeKey} p-6 max-w-4xl mx-auto text-fg space-y-6`}>
      <header className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Vault settings</h1>
          <p className="text-sm text-fg">Configure vault behavior and theme.</p>
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
        className="space-y-6"
      >
        {error ? (
          <div className="rounded-xl border border-danger-600 bg-danger-100 p-3 text-sm text-danger-700">
            {error}
          </div>
        ) : null}

        <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-fg">
            <span className="h-2 w-2 rounded-full bg-accent-500" />
            Basics
          </div>

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

          {themeChanged ? (
            <div className="rounded-2xl border border-border bg-surface-100 p-4 space-y-3 text-surface-800">
              <div className="text-sm font-semibold">Theme preview</div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-primary-600 p-4 text-primary-200">
                  <div className="text-xs uppercase tracking-wide text-primary-200">
                    Primary
                  </div>
                  <div className="mt-2 text-sm font-semibold text-primary-100">
                    Primary panel
                  </div>
                  <div className="mt-3 h-6 rounded-md bg-primary-400" />
                </div>
                <div className="rounded-xl border border-border bg-accent-600 p-4 text-accent-200">
                  <div className="text-xs uppercase tracking-wide text-accent-200">
                    Accent
                  </div>
                  <div className="mt-2 text-sm font-semibold text-accent-100">
                    Accent panel
                  </div>
                  <div className="mt-3 h-6 rounded-md bg-accent-400" />
                </div>
                <div className="rounded-xl border border-border bg-surface-300 p-4 text-primary-900">
                  <div className="text-xs uppercase tracking-wide text-primary-700">
                    Surface
                  </div>
                  <div className="mt-2 text-sm font-semibold text-primary-900">
                    Surface panel
                  </div>
                  <div className="mt-3 h-6 rounded-md bg-surface-400" />
                </div>
              </div>
            </div>
          ) : null}

          <Select
            id="system_id"
            label="System"
            value={systemId}
            onChange={(e) => handleSystemChange(e.target.value)}
          >
            <option value="">Not set</option>
            {[...systemsByFamily.entries()].map(([family, list]) => (
              <optgroup
                key={family}
                label={family}
              >
                {list.map((ed) => (
                  <option
                    key={ed.id}
                    value={ed.id}
                  >
                    {ed.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-fg">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            Transfers
          </div>

          <InputComponent
            id="allow_xfer_in"
            type="checkbox"
            label="Allow transfers in"
            checked={allowXferIn}
            className="bg-accent-400 text-accent-700"
            onChange={(e) => setAllowXferIn(e.target.checked)}
          />

          <InputComponent
            id="allow_xfer_out"
            type="checkbox"
            label="Allow transfers out"
            checked={allowXferOut}
            className="bg-accent-400 text-accent-700"
            onChange={(e) => setAllowXferOut(e.target.checked)}
          />
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-fg">
            <span className="h-2 w-2 rounded-full bg-accent-500" />
            Currencies
          </div>

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

        <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-fg">
            <span className="h-2 w-2 rounded-full bg-warning-500" />
            Workflow
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputComponent
              id="treasury_split_enabled"
              type="checkbox"
              label="Enable treasury splitting"
              checked={treasurySplitEnabled}
              className="bg-accent-400 text-accent-700"
              onChange={(e) => setTreasurySplitEnabled(e.target.checked)}
            />
            {treasurySplitEnabled && (
              <InputComponent
                id="merge_split"
                type="checkbox"
                label="Merge all currencies to base before split"
                hint="Split shares are presented in the highest denomination with fractions rounded down per currency."
                checked={mergeSplit}
                className="bg-accent-400 text-accent-700"
                onChange={(e) => setMergeSplit(e.target.checked)}
              />
            )}
          </div>

          <InputComponent
            id="reward_prep_enabled"
            type="checkbox"
            disabled
            label="Enable reward prep (coming soon)"
            checked={rewardPrepEnabled}
            className="bg-accent-400 text-accent-700"
            onChange={(e) => setRewardPrepEnabled(e.target.checked)}
          />
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-fg">
            <span className="h-2 w-2 rounded-full bg-success-500" />
            Markups (coming soon)
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InputComponent
              id="vo_buy_markup"
              type="text"
              disabled
              label="Valuable buy markup"
              hint="Example: 1.10 for +10%"
              value={voBuyMarkup}
              onChange={(e) => setVoBuyMarkup(e.target.value)}
            />
            <InputComponent
              id="vo_sell_markup"
              disabled
              type="text"
              label="Valuable sell markup"
              hint="Example: 0.90 for -10%"
              value={voSellMarkup}
              onChange={(e) => setVoSellMarkup(e.target.value)}
            />
            <InputComponent
              id="item_buy_markup"
              disabled
              type="text"
              label="Item buy markup"
              value={itemBuyMarkup}
              onChange={(e) => setItemBuyMarkup(e.target.value)}
            />
            <InputComponent
              id="item_sell_markup"
              disabled
              type="text"
              label="Item sell markup"
              value={itemSellMarkup}
              onChange={(e) => setItemSellMarkup(e.target.value)}
            />
          </div>

          {/* merge_split moved to Workflow */}
        </section>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={busy}
          >
            {busy ? "Saving..." : "Save changes"}
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
