"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Card from "@/app/_components/Card";
import { Button } from "@/app/_components/Button";
import { LinkButton } from "@/app/_components/LinkButton";
import RewardPrepAddButton from "@/app/_components/rewards/RewardPrepAddButton";
import ErrorMessage from "@/app/_components/ErrorMessage";
import { HiOutlineTrash, HiPencilSquare } from "react-icons/hi2";
import { useGlobalUI } from "@/app/_context/GlobalUIProvider";
import IconComponent from "@/app/_components/IconComponent";

function PrepRewardsClient({ vaultId, rewards, error, onGiveReward }) {
  const [busyId, setBusyId] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const { toggleSpinner } = useGlobalUI();
  const router = useRouter();

  const visibleRewards = useMemo(() => {
    if (showArchived) return rewards;
    return rewards.filter((reward) => !reward?.archived);
  }, [rewards, showArchived]);

  async function handleGiveReward(row) {
    if (!row?.id) return;
    setBusyId(row.id);
    toggleSpinner(true, "Giving reward");
    try {
      const res = await onGiveReward({ rewardId: row.id });
      if (!res?.ok) {
        toast.error(res?.error || `Could not give reward: ${row?.name}`);
        return;
      }
      toast.success(`${row?.name} successfully given to vault.`);
      router.refresh();
    } catch (err) {
      toast.error(err?.message || `Could not give reward: ${row?.name}`);
    } finally {
      toggleSpinner(false);
      setBusyId("");
    }
  }
  return (
    <div className="px-6 py-6 text-fg space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-fg">Prepare rewards</h1>
          <p className="text-sm text-muted-fg">
            Bundle coin, treasure, and valuables into rewards you can apply to
            the vault later.
          </p>
        </div>
        <RewardPrepAddButton vaultId={vaultId} />
      </header>

      <Card className="rounded-2xl border border-border bg-card p-0">
        <div className="border-b border-border px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-fg">Saved rewards</h2>
            <p className="mt-1 text-xs text-muted-fg">
              {visibleRewards.length} reward
              {visibleRewards.length === 1 ? "" : "s"} prepared
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowArchived((current) => !current)}
          >
            {showArchived ? "Hide archived" : "Show archived"}
          </Button>
        </div>
        <ErrorMessage error={error} />
        {visibleRewards.length === 0 ? (
          <div className="px-5 py-6 text-sm text-muted-fg">
            No rewards prepared yet. Create your first reward to stage coin and
            item bundles.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <thead className="bg-muted">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-fg w-full">
                    Reward
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-muted-fg w-1 whitespace-nowrap">
                    Holdings
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-muted-fg w-1 whitespace-nowrap">
                    Treasures
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-muted-fg w-1 whitespace-nowrap">
                    Valuables
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-fg w-1 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleRewards.map((reward) => {
                  const holdingsCount =
                    reward.prepholdings_count ??
                    reward.prepholdings?.[0]?.count ??
                    0;
                  const treasuresCount =
                    reward.preptreasures_count ??
                    reward.preptreasures?.[0]?.count ??
                    0;

                  const valuablesCount =
                    reward.prepvaluables_count ??
                    reward.prepvaluables?.[0]?.count ??
                    0;
                  return (
                    <tr
                      key={reward.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-5 py-4 text-sm text-fg">
                        {reward.name}
                        <br />

                        <span className="text-muted-fg">
                          {reward.description}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center text-sm text-fg whitespace-nowrap">
                        {holdingsCount}
                      </td>
                      <td className="px-5 py-4 text-center text-sm text-fg whitespace-nowrap">
                        {treasuresCount}
                      </td>
                      <td className="px-5 py-4 text-center text-sm text-fg whitespace-nowrap">
                        {valuablesCount}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="accent"
                            onClick={() => handleGiveReward(reward)}
                            disabled={busyId === reward.id || reward.archived}
                          >
                            Give Reward
                          </Button>
                          <LinkButton
                            size="sm"
                            variant="primary"
                            href={`/account/vaults/${vaultId}/preprewards/${reward.id}/edit`}
                            prefetch={false}
                            scroll={false}
                            icon={HiPencilSquare}
                            iconLabel="Edit reward"
                          />
                          <Button
                            size="sm"
                            variant="danger"
                            disabled
                          >
                            <IconComponent icon={HiOutlineTrash} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default PrepRewardsClient;
