/**
 * Reward prep delete modal.
 */
import Modal from "@/app/_components/Modal";
import RewardPrepDeleteDialog from "@/app/_components/rewards/RewardPrepDeleteDialog";
import { getRouteParams } from "@/app/_lib/routing/params";
import { getRewardPrepByIdDb } from "@/app/_lib/data/reward-prep.data";
import { notFound } from "next/navigation";

/**
 * Render the reward prep delete modal.
 * @param {{ params: Promise<Record<string,string>> | Record<string,string> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function RewardPrepDeleteModal({ params }) {
  const { vaultId, rewardId } = await getRouteParams(params);
  const rewardRes = await getRewardPrepByIdDb({
    vaultId,
    rewardPrepId: rewardId,
  });

  if (!rewardRes?.ok || !rewardRes?.data) {
    notFound();
  }

  return (
    <Modal title="Delete reward" size="sm">
      <RewardPrepDeleteDialog
        vaultId={vaultId}
        rewardPrepId={rewardId}
        rewardName={rewardRes.data?.name}
        isModal={true}
      />
    </Modal>
  );
}
