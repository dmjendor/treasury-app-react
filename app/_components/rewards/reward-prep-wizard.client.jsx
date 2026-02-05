/**
 * Reward prep wizard.
 */
"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Card from "@/app/_components/Card";
import Section from "@/app/_components/Section";
import SubCard from "@/app/_components/SubCard";
import { SectionHeader } from "@/app/_components/SectionHeader";
import { Button } from "@/app/_components/Button";
import { useVault } from "@/app/_context/VaultProvider";
import ErrorMessage from "@/app/_components/ErrorMessage";
import {
  rewardPrepDraftSchema,
  rewardPrepFinalizeSchema,
  rewardPrepStepFieldNames,
} from "@/app/_lib/validation/reward-prep.schema";
import {
  submitRewardPrepAction,
  updateRewardPrepAction,
} from "@/app/_lib/actions/reward-prep";
import RewardPrepStepDetails from "@/app/_components/rewards/steps/reward-prep-step-1-details";
import RewardPrepStepHoldings from "@/app/_components/rewards/steps/reward-prep-step-2-holdings";
import RewardPrepStepTreasures from "@/app/_components/rewards/steps/reward-prep-step-3-treasures";
import RewardPrepStepValuables from "@/app/_components/rewards/steps/reward-prep-step-4-valuables";
import RewardPrepStepOverview from "@/app/_components/rewards/steps/reward-prep-step-5-overview";
import { TimelockedButton } from "@/app/_components/TimeLockedButton";

const defaultValues = {
  name: "",
  description: "",
  value_unit: "common",
  holdings: [],
  treasures: [],
  valuables: [],
};

/**
 * Render the reward prep wizard.
 * @param {{ isModal?: boolean, initialValues?: any, initialStep?: number, lockStep?: boolean }} props
 * @returns {JSX.Element}
 */
export default function RewardPrepWizard({
  isModal = false,
  initialValues,
  initialStep = 1,
  lockStep = false,
}) {
  const { vault } = useVault();
  const router = useRouter();
  const mergedDefaults = useMemo(() => {
    const initialHoldings = Array.isArray(initialValues?.holdings)
      ? initialValues.holdings
      : defaultValues.holdings;
    const initialTreasures = Array.isArray(initialValues?.treasures)
      ? initialValues.treasures
      : defaultValues.treasures;
    const initialValuables = Array.isArray(initialValues?.valuables)
      ? initialValues.valuables
      : defaultValues.valuables;

    return {
      ...defaultValues,
      ...initialValues,
      holdings: initialHoldings,
      treasures: initialTreasures,
      valuables: initialValuables,
    };
  }, [initialValues]);

  const form = useForm({
    resolver: zodResolver(rewardPrepDraftSchema),
    shouldUnregister: false,
    defaultValues: mergedDefaults,
    mode: "onBlur",
  });
  const { submitCount, isSubmitSuccessful } = form.formState;

  const [step, setStep] = useState(initialStep);
  const [submitError, setSubmitError] = useState("");
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submitLocked, setSubmitLocked] = useState(false);
  const isEditing = Boolean(mergedDefaults?.reward_prep_id);

  const stepTitles = useMemo(
    () => ({
      1: "Reward details",
      2: "Holdings",
      3: "Treasures",
      4: "Valuables",
      5: "Overview",
    }),
    [],
  );

  const StepComponent = useMemo(() => {
    if (step === 1) return RewardPrepStepDetails;
    if (step === 2) return RewardPrepStepHoldings;
    if (step === 3) return RewardPrepStepTreasures;
    if (step === 4) return RewardPrepStepValuables;
    return RewardPrepStepOverview;
  }, [step]);

  useEffect(() => {
    if (step !== 5) {
      setSubmitLocked(false);
      return undefined;
    }

    setSubmitLocked(true);
    const timer = setTimeout(() => {
      setSubmitLocked(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [step]);

  const goNext = async () => {
    if (lockStep) return;
    const fields = rewardPrepStepFieldNames[step] || [];
    const valid = await form.trigger(fields);
    if (valid) {
      setStep((current) => Math.min(5, current + 1));
    }
  };

  const goBack = () => {
    if (lockStep) return;
    setStep((current) => Math.max(1, current - 1));
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError("");
    console.log("SUBMITTING");
    setSubmitStatus("idle");
    const finalResult = rewardPrepFinalizeSchema.safeParse(values);
    if (!finalResult.success) {
      const message =
        finalResult.error?.errors?.[0]?.message ||
        "Fill out the reward name and add at least one reward item.";
      setSubmitError(message);
      setSubmitStatus("error");
      return;
    }
    const action = isEditing
      ? updateRewardPrepAction
      : submitRewardPrepAction;
    const result = await action({
      vaultId: vault?.id,
      rewardPrepId: values.reward_prep_id,
      name: values.name,
      description: values.description,
      value_unit: values.value_unit,
      holdings: values.holdings,
      treasures: values.treasures,
      valuables: values.valuables,
    });
    if (!result?.ok) {
      setSubmitError(result?.error || "Reward could not be saved.");
      setSubmitStatus("error");
      return;
    }
    setSubmitStatus("success");
    router.refresh();
  });

  const handleSubmit = (event) => {
    if (step < 5) {
      event.preventDefault();
      return;
    }
    return onSubmit(event);
  };

  const values = form.watch();
  const nameValue = typeof values?.name === "string" ? values.name.trim() : "";
  const hasHoldings =
    Array.isArray(values?.holdings) && values.holdings.length > 0;
  const hasTreasures =
    Array.isArray(values?.treasures) && values.treasures.length > 0;
  const hasValuables =
    Array.isArray(values?.valuables) && values.valuables.length > 0;
  const canSubmit = Boolean(
    nameValue && (hasHoldings || hasTreasures || hasValuables),
  );

  const resetWizard = () => {
    form.reset(defaultValues);
    setSubmitError("");
    setSubmitStatus("idle");
    setStep(1);
  };

  const isSuccess =
    submitStatus === "success" &&
    step === 5 &&
    submitCount > 0 &&
    isSubmitSuccessful;
  const showStartAnother = isSuccess && !isEditing;

  const closeWizard = () => {
    if (isModal) {
      router.back();
      return;
    }
    if (vault?.id) {
      router.replace(`/account/vaults/${vault.id}/preprewards`);
      return;
    }
    router.back();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <Card className="space-y-4">
        <SectionHeader
          title={stepTitles[step]}
          action={
            <span className="text-xs text-muted-fg">Step {step} of 5</span>
          }
        />

        <Section>
          <StepComponent
            form={form}
            vault={vault}
            currencies={vault?.currencyList ?? []}
            baseCurrencyId={vault?.base_currency_id ?? null}
          />
        </Section>

        {submitError ? <ErrorMessage error={submitError} /> : null}

        {isSuccess ? (
          <SubCard>
            {isEditing
              ? "Reward updated. You can close this window or keep reviewing."
              : "Reward prepared. You can create another one or head back to the list."}
          </SubCard>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {!lockStep ? (
            isSuccess ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeWizard}
              >
                Close
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goBack}
                disabled={step === 1}
              >
                Back
              </Button>
            )
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            {showStartAnother ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={resetWizard}
              >
                Start another
              </Button>
            ) : null}

            {!lockStep && step < 5 ? (
              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={goNext}
              >
                Next
              </Button>
            ) : null}
            {step === 5 &&
            !(submitStatus === "success" && isSubmitSuccessful) ? (
              <TimelockedButton
                type="submit"
                lockMs={2500}
                variant="accent"
                size="sm"
                disabled={submitLocked || !canSubmit}
              >
                {isEditing ? "Save changes" : "Submit"}
              </TimelockedButton>
            ) : null}
          </div>
        </div>
      </Card>
    </form>
  );
}
