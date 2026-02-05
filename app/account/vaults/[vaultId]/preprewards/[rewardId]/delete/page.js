/**
 * Reward prep delete page.
 */
import Card from "@/app/_components/Card";
import RewardPrepDeleteDialog from "@/app/_components/rewards/RewardPrepDeleteDialog";
import { getRouteParams } from "@/app/_lib/routing/params";
import { getRewardPrepByIdDb } from "@/app/_lib/data/reward-prep.data";
import { notFound } from "next/navigation";

/**
 * Render the reward prep delete page.
 * @param {{ params: Promise<Record<string,string>> | Record<string,string> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function RewardPrepDeletePage({ params }) {
  const { vaultId, rewardId } = await getRouteParams(params);
  const rewardRes = await getRewardPrepByIdDb({
    vaultId,
    rewardPrepId: rewardId,
  });

  if (!rewardRes?.ok || !rewardRes?.data) {
    notFound();
  }

  return (
    <div className="px-6 py-6 text-fg">
      <Card className="max-w-xl mx-auto p-0">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-semibold text-fg">Delete reward</h1>
          <p className="text-sm text-muted-fg">
            Confirm you want to delete this reward.
          </p>
        </div>
        <RewardPrepDeleteDialog
          vaultId={vaultId}
          rewardPrepId={rewardId}
          rewardName={rewardRes.data?.name}
          isModal={false}
        />
      </Card>
    </div>
  );
}
