/**
 * Prepare Rewards page (account only).
 */

import { getRouteParams } from "@/app/_lib/routing/params";
import {
  fetchRewardPrepAction,
  giveRewardAction,
} from "@/app/_lib/actions/reward-prep";
import PrepRewardsClient from "@/app/_components/PrepRewardsClient";

/**
 * Render the prepare rewards page.
 * @param {{ params: Promise<Record<string,string>> | Record<string,string> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function PrepareRewardsPage({ params }) {
  const { vaultId } = await getRouteParams(params);
  const { data: rewards, error } = await fetchRewardPrepAction({ vaultId });

  async function handleGiveReward(input) {
    "use server";
    return giveRewardAction({
      vaultId,
      rewardPrepId: input?.rewardId,
    });
  }

  return (
    <PrepRewardsClient
      vaultId={vaultId}
      onGiveReward={handleGiveReward}
      rewards={Array.isArray(rewards) ? rewards : []}
      error={error}
    />
  );
}
