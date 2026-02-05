// app/_components/NewVaultWizard.js
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/Button";
import NewVaultStepBasics from "@/app/_components/vaults/steps/new-vault-step-1-basics";
import NewVaultStepCurrencies from "@/app/_components/vaults/steps/new-vault-step-2-currencies";
import NewVaultStepContainers from "@/app/_components/vaults/steps/new-vault-step-3-containers";
import NewVaultStepSettings from "@/app/_components/vaults/steps/new-vault-step-4-settings";
import NewVaultStepReview from "@/app/_components/vaults/steps/new-vault-step-5-review";
import { createVaultAction } from "@/app/_lib/actions/vaults";
import { updateVaultSettingsAction } from "@/app/_lib/actions/vaults";
import { createContainerAction } from "@/app/_lib/actions/containers";
import {
  newVaultDraftSchema,
  newVaultFinalizeSchema,
  newVaultStepFieldNames,
} from "@/app/_lib/validation/new-vault.schema";

const STEPS = [
  { id: "basics", title: "Basics" },
  { id: "currencies", title: "Currencies" },
  { id: "containers", title: "Containers" },
  { id: "settings", title: "Settings" },
  { id: "review", title: "Review" },
];

/**
 * Render the new vault wizard scaffold.
 * @param {{ systems?: Array<any>, themes?: Array<any> }} props
 * @returns {JSX.Element}
 */
export default function NewVaultWizard({
  systems = [],
  themes = [],
  showTitle = true,
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = STEPS[stepIndex]?.id ?? "basics";
  const canGoBack = stepIndex > 0;
  const canGoNext = stepIndex < STEPS.length - 1;
  const [name, setName] = useState("");
  const [systemId, setSystemId] = useState("");
  const [themeId, setThemeId] = useState("");
  const [currencies, setCurrencies] = useState([]);
  const [baseCurrencyId, setBaseCurrencyId] = useState("");
  const [commonCurrencyId, setCommonCurrencyId] = useState("");
  const [newCurrency, setNewCurrency] = useState({
    name: "",
    code: "",
    rate: "1",
  });
  const [containers, setContainers] = useState([]);
  const [newContainer, setNewContainer] = useState({
    name: "",
    is_hidden: false,
  });
  const [defaultContainers, setDefaultContainers] = useState([]);
  const [loadingDefaults, setLoadingDefaults] = useState(false);
  const [allowXferIn, setAllowXferIn] = useState(true);
  const [allowXferOut, setAllowXferOut] = useState(false);
  const [treasurySplitEnabled, setTreasurySplitEnabled] = useState(true);
  const [rewardPrepEnabled, setRewardPrepEnabled] = useState(true);
  const [mergeSplit, setMergeSplit] = useState("per_currency");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [stepErrors, setStepErrors] = useState({});

  const stepLabels = useMemo(() => STEPS.map((step) => step.title), []);

  const systemsByFamily = useMemo(() => {
    const map = new Map();
    for (const system of systems || []) {
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

  const sortedThemes = useMemo(() => {
    return [...(themes || [])].sort((a, b) =>
      String(a?.name || "").localeCompare(String(b?.name || "")),
    );
  }, [themes]);

  const selectedSystem = useMemo(() => {
    return (
      (systems || []).find(
        (system) => String(system.id) === String(systemId),
      ) || null
    );
  }, [systems, systemId]);

  const systemDefaults = useMemo(() => {
    const defaultsRaw = selectedSystem?.default_currencies;
    if (!defaultsRaw) return [];

    if (Array.isArray(defaultsRaw)) return defaultsRaw;

    if (typeof defaultsRaw === "string") {
      try {
        const parsed = JSON.parse(defaultsRaw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  }, [selectedSystem]);

  function makeCurrencyRow(row) {
    return {
      localId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: String(row?.name || "").trim(),
      code: String(row?.code || "").trim(),
      rate: row?.rate != null ? String(row.rate) : "1",
    };
  }

  function handleAddCurrency() {
    const trimmedName = String(newCurrency.name || "").trim();
    const trimmedCode = String(newCurrency.code || "").trim();
    const rateNum = Number(newCurrency.rate);
    if (!trimmedName || !trimmedCode || !Number.isFinite(rateNum)) return;

    const row = makeCurrencyRow({
      name: trimmedName,
      code: trimmedCode,
      rate: rateNum,
    });

    setCurrencies((prev) => [...prev, row]);
    setNewCurrency({ name: "", code: "", rate: "1" });
    setStepErrors((prev) => {
      if (!prev.currencies) return prev;
      const next = { ...prev };
      delete next.currencies;
      return next;
    });

    if (!baseCurrencyId && Number(rateNum) === 1) {
      setBaseCurrencyId(row.localId);
    }
    if (!commonCurrencyId) {
      setCommonCurrencyId(row.localId);
    }
  }

  function handleRemoveCurrency(localId) {
    setCurrencies((prev) => prev.filter((row) => row.localId !== localId));
    if (String(baseCurrencyId) === String(localId)) {
      setBaseCurrencyId("");
    }
    if (String(commonCurrencyId) === String(localId)) {
      setCommonCurrencyId("");
    }
    setStepErrors((prev) => {
      if (!prev.currencies) return prev;
      const next = { ...prev };
      delete next.currencies;
      return next;
    });
  }

  function handleUseSystemDefaults() {
    if (!systemDefaults.length) return;

    const rows = systemDefaults
      .map((row) => makeCurrencyRow(row))
      .filter((row) => row.name && row.code);

    if (!rows.length) return;

    setCurrencies(rows);

    const baseRow = rows.find((row) => Number(row.rate) === 1) || rows[0];
    setBaseCurrencyId(baseRow?.localId || "");
    setCommonCurrencyId(rows[0]?.localId || "");
    setStepErrors((prev) => {
      if (!prev.currencies) return prev;
      const next = { ...prev };
      delete next.currencies;
      return next;
    });
  }

  function handleAddContainer() {
    const trimmedName = String(newContainer.name || "").trim();
    if (!trimmedName) return;

    const row = {
      localId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: trimmedName,
      is_hidden: Boolean(newContainer.is_hidden),
    };

    setContainers((prev) => [...prev, row]);
    setNewContainer({ name: "", is_hidden: false });
    setStepErrors((prev) => {
      if (!prev.containers) return prev;
      const next = { ...prev };
      delete next.containers;
      return next;
    });
  }

  function handleRemoveContainer(localId) {
    setContainers((prev) => prev.filter((row) => row.localId !== localId));
    setStepErrors((prev) => {
      if (!prev.containers) return prev;
      const next = { ...prev };
      delete next.containers;
      return next;
    });
  }

  async function loadDefaultContainers() {
    if (loadingDefaults) return;
    setLoadingDefaults(true);
    try {
      const res = await fetch("/api/default-containers", {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load default containers.");
      const data = await res.json();
      const names = Array.isArray(data?.names) ? data.names : [];
      const cleaned = names
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean);
      setDefaultContainers(Array.from(new Set(cleaned)).sort());
    } catch {
      setDefaultContainers([]);
    } finally {
      setLoadingDefaults(false);
    }
  }

  function handleAddDefaultContainer(name) {
    const trimmedName = String(name || "").trim();
    if (!trimmedName) return;

    const row = {
      localId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: trimmedName,
      is_hidden: false,
    };

    setContainers((prev) => [...prev, row]);
    setStepErrors((prev) => {
      if (!prev.containers) return prev;
      const next = { ...prev };
      delete next.containers;
      return next;
    });
  }

  function buildDraft() {
    return {
      name,
      system_id: systemId || null,
      theme_id: themeId || null,
      currencies: currencies.map((row) => ({
        name: row.name,
        code: row.code,
        rate: Number(row.rate),
      })),
      base_currency_id: baseCurrencyId || null,
      common_currency_id: commonCurrencyId || null,
      containers: containers.map((row) => ({
        name: row.name,
        is_hidden: row.is_hidden,
      })),
      allow_xfer_in: allowXferIn,
      allow_xfer_out: allowXferOut,
      treasury_split_enabled: treasurySplitEnabled,
      reward_prep_enabled: rewardPrepEnabled,
      merge_split: mergeSplit,
      vo_buy_markup: 0,
      vo_sell_markup: 0,
      item_buy_markup: 0,
      item_sell_markup: 0,
    };
  }

  function validateStep() {
    const parsed = newVaultDraftSchema.safeParse(buildDraft());
    if (parsed.success) {
      setStepErrors({});
      return true;
    }

    const stepNumber = stepIndex + 1;
    const fields = new Set(newVaultStepFieldNames[stepNumber] || []);
    const errors = {};

    for (const issue of parsed.error.issues || []) {
      const field = issue.path?.[0];
      if (!field || !fields.has(field)) continue;
      if (!errors[field]) errors[field] = issue.message;
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function goNext() {
    if (!canGoNext) return;
    if (!validateStep()) return;
    setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
  }

  function goBack() {
    if (!canGoBack) return;
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }

  function resolveVaultId(result) {
    if (result?.data?.id) return result.data.id;
    if (result?.data?.vault?.id) return result.data.vault.id;
    if (result?.data?.data?.id) return result.data.data.id;
    if (result?.data?.data?.vault?.id) return result.data.data.vault.id;
    if (result?.data?.vaultId) return result.data.vaultId;
    return null;
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitError("");

    const draft = buildDraft();

    const parsed = newVaultFinalizeSchema.safeParse(draft);
    if (!parsed.success) {
      setSubmitError(parsed.error.errors?.[0]?.message || "Invalid data.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      if (systemId) formData.set("system_id", systemId);
      if (themeId) formData.set("theme_id", themeId);
      formData.set("allow_xfer_in", String(allowXferIn));
      formData.set("allow_xfer_out", String(allowXferOut));
      formData.set("treasury_split_enabled", String(treasurySplitEnabled));
      formData.set("reward_prep_enabled", String(rewardPrepEnabled));
      formData.set("merge_split", mergeSplit);

      const createRes = await createVaultAction(formData);
      if (!createRes?.ok) {
        setSubmitError(createRes?.error || "Failed to create vault.");
        setSubmitting(false);
        return;
      }

      const vaultId = resolveVaultId(createRes);
      if (!vaultId) {
        setSubmitError("Vault created, but id was not returned.");
        setSubmitting(false);
        return;
      }

      const currencyIdMap = new Map();
      for (const row of currencies) {
        const payload = {
          name: row.name,
          code: row.code,
          rate: Number(row.rate),
        };
        const res = await fetch(`/api/vaults/${vaultId}/currencies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const body = await res.json().catch(() => null);
        if (!res.ok || !body?.ok) {
          setSubmitError(body?.error || "Failed to create currency.");
          setSubmitting(false);
          return;
        }
        const created = body?.data;
        if (created?.id) {
          currencyIdMap.set(row.localId, created.id);
        }
      }

      const baseId = currencyIdMap.get(baseCurrencyId) || null;
      const commonId = currencyIdMap.get(commonCurrencyId) || null;
      if (baseId || commonId) {
        const updateRes = await updateVaultSettingsAction({
          id: vaultId,
          base_currency_id: baseId,
          common_currency_id: commonId,
        });
        if (!updateRes?.ok) {
          setSubmitError(
            updateRes?.error || "Failed to update base/common currency.",
          );
          setSubmitting(false);
          return;
        }
      }

      for (const row of containers) {
        const fd = new FormData();
        fd.set("vault_id", vaultId);
        fd.set("name", row.name);
        fd.set("is_hidden", row.is_hidden ? "true" : "false");
        const containerRes = await createContainerAction(fd);
        if (!containerRes?.ok) {
          setSubmitError(containerRes?.error || "Failed to create container.");
          setSubmitting(false);
          return;
        }
      }

      router.replace(`/account/vaults/${vaultId}`);
      router.refresh();
    } catch (error) {
      setSubmitError(error?.message || "Failed to create vault.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 text-fg">
      <header className="space-y-2">
        {showTitle ? (
          <h2 className="text-2xl font-semibold">Create vault</h2>
        ) : null}
        <div className="flex flex-wrap gap-2 text-xs text-muted-fg">
          {stepLabels.map((label, index) => (
            <span
              key={label}
              className={[
                "rounded-full border px-3 py-1",
                index === stepIndex
                  ? "border-accent-600 bg-accent-100 text-accent-900"
                  : "border-border bg-card",
              ].join(" ")}
            >
              {index + 1}. {label}
            </span>
          ))}
        </div>
      </header>

      {currentStep === "basics" ? (
        <NewVaultStepBasics
          name={name}
          setName={setName}
          systemId={systemId}
          setSystemId={setSystemId}
          themeId={themeId}
          setThemeId={setThemeId}
          systemsByFamily={systemsByFamily}
          sortedThemes={sortedThemes}
          stepErrors={stepErrors}
          setStepErrors={setStepErrors}
        />
      ) : null}

      {currentStep === "currencies" ? (
        <NewVaultStepCurrencies
          currencies={currencies}
          newCurrency={newCurrency}
          setNewCurrency={setNewCurrency}
          baseCurrencyId={baseCurrencyId}
          setBaseCurrencyId={setBaseCurrencyId}
          commonCurrencyId={commonCurrencyId}
          setCommonCurrencyId={setCommonCurrencyId}
          systemDefaults={systemDefaults}
          stepErrors={stepErrors}
          setStepErrors={setStepErrors}
          onAddCurrency={handleAddCurrency}
          onRemoveCurrency={handleRemoveCurrency}
          onUseSystemDefaults={handleUseSystemDefaults}
        />
      ) : null}

      {currentStep === "containers" ? (
        <NewVaultStepContainers
          containers={containers}
          newContainer={newContainer}
          setNewContainer={setNewContainer}
          defaultContainers={defaultContainers}
          loadingDefaults={loadingDefaults}
          loadDefaultContainers={loadDefaultContainers}
          onAddDefaultContainer={handleAddDefaultContainer}
          onAddContainer={handleAddContainer}
          onRemoveContainer={handleRemoveContainer}
          stepErrors={stepErrors}
        />
      ) : null}

      {currentStep === "settings" ? (
        <NewVaultStepSettings
          allowXferIn={allowXferIn}
          setAllowXferIn={setAllowXferIn}
          allowXferOut={allowXferOut}
          setAllowXferOut={setAllowXferOut}
          treasurySplitEnabled={treasurySplitEnabled}
          setTreasurySplitEnabled={setTreasurySplitEnabled}
          rewardPrepEnabled={rewardPrepEnabled}
          setRewardPrepEnabled={setRewardPrepEnabled}
          mergeSplit={mergeSplit}
          setMergeSplit={setMergeSplit}
          stepErrors={stepErrors}
          setStepErrors={setStepErrors}
        />
      ) : null}

      {currentStep === "review" ? (
        <NewVaultStepReview
          name={name}
          selectedSystem={selectedSystem}
          sortedThemes={sortedThemes}
          themeId={themeId}
          currencies={currencies}
          baseCurrencyId={baseCurrencyId}
          commonCurrencyId={commonCurrencyId}
          containers={containers}
          allowXferIn={allowXferIn}
          allowXferOut={allowXferOut}
          treasurySplitEnabled={treasurySplitEnabled}
          rewardPrepEnabled={rewardPrepEnabled}
          mergeSplit={mergeSplit}
          submitError={submitError}
        />
      ) : null}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={goBack}
          disabled={!canGoBack}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={currentStep === "review" ? handleSubmit : goNext}
          disabled={currentStep === "review" ? submitting : !canGoNext}
        >
          {currentStep === "review"
            ? submitting
              ? "Creating..."
              : "Create vault"
            : "Next"}
        </Button>
      </div>
    </div>
  );
}
