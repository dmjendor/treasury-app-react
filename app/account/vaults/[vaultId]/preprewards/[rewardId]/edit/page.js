/**
 * Reward prep edit page.
 */
import RewardPrepWizard from "@/app/_components/rewards/reward-prep-wizard.client";
import { getRouteParams } from "@/app/_lib/routing/params";
import { getRewardPrepByIdDb } from "@/app/_lib/data/reward-prep.data";
import { notFound } from "next/navigation";

function toInitialValues(reward) {
  return {
    reward_prep_id: reward.id,
    name: reward.name ?? "",
    description: reward.description ?? "",
    value_unit: reward.value_unit ?? "common",
    holdings: Array.isArray(reward.prepholdings)
      ? reward.prepholdings.map((row) => ({
          currency_id: row.currency_id,
          value: row.value ?? 0,
        }))
      : [],
    treasures: Array.isArray(reward.preptreasures)
      ? reward.preptreasures.map((row) => ({
          container_id: row.container_id,
          name: row.name,
          genericname: row.genericname ?? null,
          description: row.description ?? null,
          value: row.value ?? 0,
          quantity: row.quantity ?? 0,
          identified: Boolean(row.identified),
          magical: Boolean(row.magical),
          archived: Boolean(row.archived),
        }))
      : [],
    valuables: Array.isArray(reward.prepvaluables)
      ? reward.prepvaluables.map((row) => ({
          container_id: row.container_id,
          name: row.name,
          description: row.description ?? null,
          value: row.value ?? 0,
          quantity: row.quantity ?? 0,
        }))
      : [],
  };
}

/**
 * Render the reward prep edit page.
 * @param {{ params: Promise<Record<string,string>> | Record<string,string> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function RewardPrepEditPage({ params }) {
  const { vaultId, rewardId } = await getRouteParams(params);
  const rewardRes = await getRewardPrepByIdDb({
    vaultId,
    rewardPrepId: rewardId,
  });

  if (!rewardRes?.ok || !rewardRes?.data) {
    notFound();
  }

  const initialValues = toInitialValues(rewardRes.data);
  const isArchived = Boolean(rewardRes.data?.archived);

  return (
    <div className="px-6 py-6 text-fg">
      <RewardPrepWizard
        initialValues={initialValues}
        initialStep={isArchived ? 5 : 1}
        lockStep={isArchived}
      />
    </div>
  );
}
