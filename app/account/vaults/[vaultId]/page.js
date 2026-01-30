import {
  HiOutlineBolt,
  HiOutlineClock,
  HiOutlineBookOpen,
  HiOutlineSwatch,
} from "react-icons/hi2";
import Link from "next/link";
import Card from "@/app/_components/Card";
import { LinkButton } from "@/app/_components/LinkButton";
import IconComponent from "@/app/_components/IconComponent";
import SubCard from "@/app/_components/SubCard";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import BackpackIcon from "@/app/_components/icons/BackpackIcon";
import BattleGearIcon from "@/app/_components/icons/BattleGearIcon";
import GemsIcon from "@/app/_components/icons/GemsIcon";

function Panel({ title, icon: Icon, children }) {
  return (
    <Card className="rounded-2xl p-6">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-5 w-5 text-accent-500" /> : null}
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function StatCard({ label, value, icon, href }) {
  const content = (
    <Card className="rounded-2xl p-5 transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-fg">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-fg">{value}</div>
        </div>

        <div className="rounded-xl bg-accent-600 p-2 text-accent-50">
          <IconComponent
            icon={icon}
            title={label}
            size="lg"
          />
        </div>
      </div>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function EmptyList({ title, hint }) {
  return (
    <SubCard className="py-4 text-sm">
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-subcard-fg/80">{hint}</div>
    </SubCard>
  );
}

function DetailCard({ icon, label, value, hint }) {
  return (
    <SubCard>
      <div className="flex items-center gap-2 text-xs text-subcard-fg/80">
        {icon ? (
          <IconComponent
            icon={icon}
            size="lg"
            variant="accent"
          />
        ) : null}
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
      {hint ? (
        <div className="mt-1 text-xs text-subcard-fg/80">{hint}</div>
      ) : null}
    </SubCard>
  );
}

export default async function VaultOverviewPage({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const { vaultId } = resolvedParams;
  const {
    id,
    active,
    name,
    system_id,
    theme_id,
    system,
    theme,
    containers_count,
    treasure_count,
    currencies_count,
    valuables_count,
  } = await getVaultById(vaultId);

  return (
    <div className="space-y-8 text-fg">
      {/* Top: quick stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Currencies"
          value={currencies_count}
          icon={BackpackIcon}
          href={`/account/vaults/${vaultId}/currencies`}
        />
        <StatCard
          label="Containers"
          value={containers_count}
          icon={BackpackIcon}
          href={`/account/vaults/${vaultId}/containers`}
        />
        <StatCard
          label="Treasures"
          value={treasure_count}
          icon={BattleGearIcon}
          href={`/account/vaults/${vaultId}/treasures`}
        />

        <StatCard
          label="Valuables"
          value={valuables_count}
          icon={GemsIcon}
          href={`/account/vaults/${vaultId}/valuables`}
        />
      </div>

      {/* Middle: two columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Recent activity"
          icon={HiOutlineClock}
        >
          <div className="space-y-3">
            <EmptyList
              title="No activity yet"
              hint="Once you start adding treasure, edits and changes will show up here."
            />
          </div>
        </Panel>

        <Panel
          title="Vault details"
          icon={HiOutlineBolt}
        >
          <div className="grid gap-3">
            <DetailCard
              icon={HiOutlineBookOpen}
              label="System"
              value={system?.name}
            />

            <DetailCard
              icon={HiOutlineSwatch}
              label="Theme"
              value={theme?.name}
            />

            <DetailCard
              label="Permissions"
              value="GM only (for now)"
              hint="Later you can add players and set roles."
            />
          </div>
        </Panel>
      </div>

      {/* Bottom: next actions */}
      <Panel
        title="Next actions"
        icon={HiOutlineBolt}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <LinkButton
            href={`/account/vaults/${vaultId}/containers/new`}
            variant="primary"
          >
            Create container
          </LinkButton>

          <LinkButton
            href={`/account/vaults/${vaultId}/currencies/new`}
            variant="accent"
          >
            Add currency
          </LinkButton>

          <LinkButton
            href={`/account/vaults/${vaultId}/treasures/new`}
            variant="primary"
          >
            Add treasure
          </LinkButton>

          <LinkButton
            href={`/account/vaults/${vaultId}/settings`}
            variant="outline"
          >
            Vault settings
          </LinkButton>
        </div>

        <div className="mt-4 text-xs text-muted-fg">
          These are placeholders now. Later, you can conditionally show the best
          next step based on what&apos;s missing.
        </div>
      </Panel>
    </div>
  );
}
