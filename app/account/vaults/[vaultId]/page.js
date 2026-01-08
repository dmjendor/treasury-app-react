import {
  HiOutlineArchiveBox,
  HiOutlineGift,
  HiOutlineCurrencyDollar,
  HiOutlineSparkles,
  HiOutlineBolt,
  HiOutlineClock,
  HiOutlineBookOpen,
  HiOutlineSwatch,
} from "react-icons/hi2";
import Link from "next/link";

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-surface-800/60 p-6 backdrop-blur">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-5 w-5 text-ink-700" /> : null}
        <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatCard({ label, value, icon: Icon, href }) {
  const content = (
    <div className="rounded-2xl border border-white/10 bg-surface-800/60 p-5 backdrop-blur transition hover:bg-surface-800/75">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-ink-600">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-ink-900">
            {value}
          </div>
        </div>
        <div className="rounded-xl bg-white/5 p-2">
          <Icon className="h-5 w-5 text-ink-700" />
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function EmptyList({ title, hint }) {
  return (
    <div className="rounded-xl bg-white/5 p-4 text-sm text-ink-700">
      <div className="font-semibold text-ink-900">{title}</div>
      <div className="mt-1 text-ink-600">{hint}</div>
    </div>
  );
}

function ActionButton({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
    >
      {children}
    </Link>
  );
}

export default async function VaultOverviewPage({ params }) {
  const { vaultId } = await params;

  // Placeholder values for now. Replace with real counts later.
  const counts = {
    containers: 0,
    treasure: 0,
    currencies: 0,
    valuables: 0,
  };

  return (
    <div className="space-y-8">
      {/* Top: quick stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Containers"
          value={counts.containers}
          icon={HiOutlineArchiveBox}
          href={`/account/vaults/${vaultId}/containers`}
        />
        <StatCard
          label="Treasure"
          value={counts.treasure}
          icon={HiOutlineGift}
          href={`/account/vaults/${vaultId}/treasure`}
        />
        <StatCard
          label="Currencies"
          value={counts.currencies}
          icon={HiOutlineCurrencyDollar}
          href={`/account/vaults/${vaultId}/currencies`}
        />
        <StatCard
          label="Valuables"
          value={counts.valuables}
          icon={HiOutlineSparkles}
          href={`/account/vaults/${vaultId}/valuables`}
        />
      </div>

      {/* Middle: two columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Recent activity"
          icon={HiOutlineClock}
        >
          {/* Later: activity feed component */}
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
          {/* Later: real vault metadata */}
          <div className="grid gap-3">
            <div className="rounded-xl bg-white/5 p-4">
              <div className="flex items-center gap-2 text-xs text-ink-600">
                <HiOutlineBookOpen className="h-4 w-4" />
                Edition
              </div>
              <div className="mt-1 text-sm font-semibold text-ink-900">
                Not set
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-4">
              <div className="flex items-center gap-2 text-xs text-ink-600">
                <HiOutlineSwatch className="h-4 w-4" />
                Theme
              </div>
              <div className="mt-1 text-sm font-semibold text-ink-900">
                Default
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-4">
              <div className="text-xs text-ink-600">Permissions</div>
              <div className="mt-1 text-sm font-semibold text-ink-900">
                GM only (for now)
              </div>
              <div className="mt-1 text-xs text-ink-600">
                Later you can add players and set roles.
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Bottom: next actions */}
      <Panel
        title="Next actions"
        icon={HiOutlineBolt}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <ActionButton href={`/account/vaults/${vaultId}/containers/new`}>
            Create container
          </ActionButton>
          <ActionButton href={`/account/vaults/${vaultId}/currencies/new`}>
            Add currency
          </ActionButton>
          <ActionButton href={`/account/vaults/${vaultId}/treasure/new`}>
            Add treasure
          </ActionButton>
          <Link
            href={`/account/vaults/${vaultId}/settings`}
            className="inline-flex items-center justify-center rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-ink-800 hover:bg-white/10"
          >
            Vault settings
          </Link>
        </div>

        <div className="mt-4 text-xs text-ink-600">
          These are placeholders now. Later, you can conditionally show the best
          next step based on what’s missing.
        </div>
      </Panel>
    </div>
  );
}
