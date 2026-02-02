/**
 * Reward prep wizard step 1.
 */
"use client";

import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import InputComponent from "@/app/_components/InputComponent";
import SubCard from "@/app/_components/SubCard";
import Textarea from "@/app/_components/Textarea";

/**
 * Render reward details step.
 * @param {{ form: any }} props
 * @returns {JSX.Element}
 */
export default function RewardPrepStepDetails({ form, vault }) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = form;

  const valueUnit = useWatch({ control, name: "value_unit" }) || "common";

  const currencyList = useMemo(
    () => (Array.isArray(vault?.currencyList) ? vault.currencyList : []),
    [vault],
  );
  const baseCurrency = useMemo(() => {
    const baseId = vault?.base_currency_id;
    return currencyList.find((c) => String(c.id) === String(baseId)) || null;
  }, [currencyList, vault?.base_currency_id]);
  const commonCurrency = useMemo(() => {
    const commonId = vault?.common_currency_id;
    return currencyList.find((c) => String(c.id) === String(commonId)) || null;
  }, [currencyList, vault?.common_currency_id]);

  function formatCurrencyLabel(currency, fallback) {
    if (!currency) return fallback;
    const name = currency.name || "";
    return name || fallback;
  }

  const baseLabel = formatCurrencyLabel(baseCurrency, "Base");
  const commonLabel = formatCurrencyLabel(commonCurrency, "Common");
  const showCurrencyChoice = currencyList.length > 1;

  return (
    <div className="space-y-4">
      <InputComponent
        label="Reward name"
        placeholder="Starter haul"
        error={errors?.name?.message}
        {...register("name")}
      />

      {showCurrencyChoice ? (
        <SubCard className="space-y-3">
          <div className="text-sm font-semibold text-fg">
            What currency would you like to use for values?
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <InputComponent
              id="value_unit_common"
              type="radio"
              label={commonLabel}
              value="common"
              checked={valueUnit === "common"}
              onChange={() =>
                setValue("value_unit", "common", {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                })
              }
              {...register("value_unit")}
            />
            <InputComponent
              id="value_unit_base"
              type="radio"
              label={baseLabel}
              value="base"
              checked={valueUnit === "base"}
              onChange={() =>
                setValue("value_unit", "base", {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                })
              }
              {...register("value_unit")}
            />
          </div>
        </SubCard>
      ) : null}

      <Textarea
        label="Description"
        rows={4}
        placeholder="Short note about where this reward comes from."
        error={errors?.description?.message}
        {...register("description")}
      />
    </div>
  );
}
