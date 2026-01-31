/**
 * Prepare Rewards page (account only).
 */
import Card from "@/app/_components/Card";
import { Button } from "@/app/_components/Button";
import RewardPrepAddButton from "@/app/_components/rewards/RewardPrepAddButton";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { getRouteParams } from "@/app/_lib/routing/params";
import { notFound } from "next/navigation";

function formatCurrencyTotal(total) {
  const value = Number(total);
  return Number.isFinite(value) ? value.toLocaleString() : "0";
}

/**
 * Render the prepare rewards page.
 * @param {{ params: Promise<Record<string,string>> | Record<string,string> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function PrepareRewardsPage({ params }) {
  const { vaultId } = await getRouteParams(params);
  const vault = await getVaultById(vaultId);
  if (!vault) notFound();

  const rewards = [];

  return (
    <div className="px-6 py-6 text-fg space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-fg">Prepare rewards</h1>
          <p className="text-sm text-muted-fg">
            Bundle coin, treasure, and valuables into rewards you can apply to the
            vault later.
          </p>
        </div>
        <RewardPrepAddButton vaultId={vaultId} />
      </header>

      <Card className="rounded-2xl border border-border bg-card p-0">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-fg">Saved rewards</h2>
          <p className="mt-1 text-xs text-muted-fg">
            {rewards.length} reward{rewards.length === 1 ? "" : "s"} prepared
          </p>
        </div>

        {rewards.length === 0 ? (
          <div className="px-5 py-6 text-sm text-muted-fg">
            No rewards prepared yet. Create your first reward to stage coin and
            item bundles.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-fg">
                    Reward
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-fg">
                    Currency total
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-fg">
                    Treasures
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-fg">
                    Valuables
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-fg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((reward) => (
                  <tr
                    key={reward.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-5 py-4 text-sm text-fg">
                      {reward.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-fg">
                      {formatCurrencyTotal(reward.currencyTotal)}
                    </td>
                    <td className="px-5 py-4 text-sm text-fg">
                      {reward.treasureCount}
                    </td>
                    <td className="px-5 py-4 text-sm text-fg">
                      {reward.valuableCount}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="accent"
                          disabled
                        >
                          Apply
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
