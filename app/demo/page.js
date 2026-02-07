// app/demo/page.js
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/app/_components/Button";
import { ThemeScope } from "@/app/_components/ThemeScope";
import DemoSplitHoldingsModal from "@/app/demo/DemoSplitHoldingsModal";
import PublicVaultOverviewClient from "@/app/public/vaults/[vaultId]/PublicVaultOverviewClient";

const demoVaultId = "demo-vault";

const demoCurrencies = [
  { id: "cur-gp", name: "Gold", code: "GP", rate: 100 },
  { id: "cur-sp", name: "Silver", code: "SP", rate: 10 },
  { id: "cur-cp", name: "Copper", code: "CP", rate: 1 },
];

const demoContainers = [
  { id: "c1", name: "Main Pack", is_hidden: false },
  { id: "c2", name: "Party Chest", is_hidden: false },
  { id: "c3", name: "Hidden Stash", is_hidden: true },
];

const demoTreasures = [
  {
    id: "t1",
    name: "Jeweled Goblet",
    genericname: "Silver goblet",
    value: 250,
    quantity: 1,
    container_id: "c2",
    magical: false,
    identified: true,
  },
  {
    id: "t2",
    name: "Ancient Idol",
    genericname: "Stone idol",
    value: 800,
    quantity: 1,
    container_id: "c2",
    magical: true,
    identified: false,
  },
  {
    id: "t3",
    name: "Travel Rations",
    genericname: "",
    value: 25,
    quantity: 6,
    container_id: "c1",
    magical: false,
    identified: true,
  },
];

const demoValuables = [
  {
    id: "v1",
    name: "Ruby Pendant",
    value: 500,
    quantity: 1,
    container_id: "c1",
  },
  {
    id: "v2",
    name: "Emerald Ring",
    value: 350,
    quantity: 1,
    container_id: "c2",
  },
];

const demoBalancesSeed = [
  { currency_id: "cur-gp", total_value: 32 },
  { currency_id: "cur-sp", total_value: 140 },
  { currency_id: "cur-cp", total_value: 780 },
];

const demoVault = {
  id: demoVaultId,
  name: "The Ember Vault (Demo)",
  active: true,
  user_id: "demo-owner",
  themeKey: "ember",
  system: { name: "D&D 5e" },
  theme: { name: "Ember" },
  containers_count: demoContainers.length,
  treasures_count: demoTreasures.length,
  valuables_count: demoValuables.length,
  base_currency_id: "cur-cp",
  common_currency_id: "cur-gp",
  currencyList: demoCurrencies,
};

/**
 * Render the public demo vault page.
 * @returns {JSX.Element}
 */
export default function DemoPage() {
  const [balances, setBalances] = useState(demoBalancesSeed);
  const [splitOpen, setSplitOpen] = useState(false);

  const balancesWithMeta = useMemo(() => {
    const map = new Map(
      demoCurrencies.map((currency) => [String(currency.id), currency]),
    );
    return balances.map((balance) => ({
      ...balance,
      name: map.get(String(balance.currency_id))?.name,
      code: map.get(String(balance.currency_id))?.code,
    }));
  }, [balances]);

  function handleDemoSell({ currencyId, amount }) {
    if (!currencyId) return;
    setBalances((prev) => {
      const next = [...prev];
      const index = next.findIndex(
        (row) => String(row.currency_id) === String(currencyId),
      );
      if (index >= 0) {
        const current = Number(next[index].total_value) || 0;
        next[index] = {
          ...next[index],
          total_value: current + (Number(amount) || 0),
        };
        return next;
      }
      return [
        ...next,
        { currency_id: String(currencyId), total_value: Number(amount) || 0 },
      ];
    });
  }

  function handleSplitApply({ remaining }) {
    if (!Array.isArray(remaining)) return;
    setBalances((prev) => {
      const next = [...prev];
      for (const row of remaining) {
        const index = next.findIndex(
          (item) => String(item.currency_id) === String(row.currency_id),
        );
        if (index >= 0) {
          next[index] = {
            ...next[index],
            total_value: Number(row.total_value) || 0,
          };
        }
      }
      return next;
    });
  }

  return (
    <ThemeScope themeKey="theme-ember">
      <div className="min-h-screen bg-bg text-fg p-6">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <header className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wide text-muted-fg">
              Demo
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-fg">
              Player View Preview
            </h1>
            <p className="mt-2 text-sm text-muted-fg">
              This is a read-only demo using fake data to showcase the public
              vault interface.
            </p>
          </header>

          <PublicVaultOverviewClient
            vaultId={demoVaultId}
            vault={demoVault}
            balances={balancesWithMeta}
            containers={demoContainers}
            currencies={demoCurrencies}
            treasures={demoTreasures}
            valuables={demoValuables}
            isOwner={false}
            canTransferTreasureOut={false}
            canTransferValuableOut={false}
            canSellTreasure={true}
            canSellValuable={true}
            holdingsAction={
              <Button
                variant="accent"
                size="sm"
                onClick={() => setSplitOpen(true)}
              >
                Split Holdings
              </Button>
            }
            demoMode={true}
            onDemoSell={handleDemoSell}
          />
        </div>
      </div>
      <DemoSplitHoldingsModal
        open={splitOpen}
        balances={balancesWithMeta}
        currencies={demoCurrencies}
        onClose={() => setSplitOpen(false)}
        onApply={handleSplitApply}
      />
    </ThemeScope>
  );
}
