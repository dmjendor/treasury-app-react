// Public vault overview page.
import {
  HiOutlineArchiveBox,
  HiOutlineCurrencyDollar,
  HiOutlineSparkles,
} from "react-icons/hi2";
import IconComponent from "@/app/_components/IconComponent";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { formatRate, normalizeCode } from "@/app/utils/currencyUtils";

const cardStyles = {
  primary:
    "rounded-2xl border border-border bg-primary-600 p-6 text-primary-50",
  surface:
    "rounded-2xl border border-border bg-surface-800 p-6 text-surface-50",
};

const titleStyles = {
  primary: "text-primary-100",
  surface: "text-surface-200",
};

const iconWrapStyles = {
  primary: "border border-border bg-primary-700",
  surface: "border border-border bg-surface-700",
};

function SectionCard({ title, icon, tone = "surface", children }) {
  return (
    <section className={cardStyles[tone] ?? cardStyles.surface}>
      <div className="flex items-center gap-3">
        {icon ? (
          <div className={`rounded-xl p-2 ${iconWrapStyles[tone]}`}>
            <IconComponent
              icon={icon}
              size="md"
              variant={tone === "primary" ? "accent" : "primary"}
            />
          </div>
        ) : null}
        <h2
          className={`text-sm font-semibold uppercase tracking-wide ${
            titleStyles[tone] ?? titleStyles.surface
          }`}
        >
          {title}
        </h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-primary-200">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-primary-50">{value}</div>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-primary-700 px-3 py-2">
      <div className="text-xs uppercase tracking-wide text-primary-200">
        {label}
      </div>
      <div className="text-lg font-semibold text-primary-50">{value}</div>
    </div>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="rounded-xl border border-border bg-surface-700 p-4 text-sm text-surface-100">
      <div className="font-semibold text-surface-50">{title}</div>
      <div className="mt-1 text-surface-200">{message}</div>
    </div>
  );
}

function ContainerCard({ container }) {
  const name = container?.name || "Unnamed container";
  const treasuresCount = container?.treasures?.[0]?.count ?? 0;
  const valuablesCount = container?.valuables?.[0]?.count ?? 0;
  const visibility = container?.is_hidden ? "Hidden" : "Visible";

  return (
    <article className="rounded-2xl border border-border bg-surface-800 p-5 text-surface-50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-surface-50">{name}</div>
          <div className="mt-2 text-xs uppercase tracking-wide text-surface-200">
            {visibility}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface-700 p-2">
          <IconComponent
            icon={HiOutlineArchiveBox}
            size="sm"
            variant="accent"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-border bg-surface-700 px-3 py-1 text-surface-100">
          Treasures: {treasuresCount}
        </span>
        <span className="rounded-full border border-border bg-surface-700 px-3 py-1 text-surface-100">
          Valuables: {valuablesCount}
        </span>
      </div>
    </article>
  );
}

/**
 * Render the public vault overview.
 * @param {{ params: { vaultId: string } }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function PublicVaultPage({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const { vaultId } = resolvedParams;
  const vault = await getVaultById(vaultId);

  const containers = (vault?.containerList ?? [])
    .slice()
    .sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
  const currencies = (vault?.currencyList ?? [])
    .slice()
    .sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <SectionCard
          title="Vault details"
          icon={HiOutlineSparkles}
          tone="primary"
        >
          <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
            <div>
              <div className="text-xs uppercase tracking-wide text-primary-200">
                Vault
              </div>
              <h1 className="mt-1 text-2xl font-semibold text-primary-50">
                {vault?.name || "Untitled vault"}
              </h1>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailItem
                  label="System"
                  value={vault?.system?.name || "Unknown"}
                />
                <DetailItem
                  label="Theme"
                  value={vault?.theme?.name || "Default"}
                />
                <DetailItem
                  label="Status"
                  value={vault?.active ? "Active" : "Inactive"}
                />
                <DetailItem
                  label="Access"
                  value="Member view"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatPill
                label="Coins"
                value={vault?.currencies_count ?? 0}
              />
              <StatPill
                label="Containers"
                value={vault?.containers_count ?? 0}
              />
              <StatPill
                label="Treasures"
                value={vault?.treasures_count ?? 0}
              />
              <StatPill
                label="Valuables"
                value={vault?.valuables_count ?? 0}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Coins"
          icon={HiOutlineCurrencyDollar}
        >
          {currencies.length === 0 ? (
            <EmptyState
              title="No coins yet"
              message="Coins added by the GM will appear here."
            />
          ) : (
            <div className="grid gap-3">
              {currencies.map((currency) => (
                <div
                  key={currency.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-700 px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-surface-50">
                      {currency.name || "Unnamed coin"}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-surface-200">
                      {normalizeCode(
                        currency.code || currency.abbreviation || "",
                      ) || "NO CODE"}
                    </div>
                  </div>
                  <div className="text-sm text-surface-100">
                    Rate: {formatRate(currency.rate) || "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Containers"
        icon={HiOutlineArchiveBox}
      >
        {containers.length === 0 ? (
          <EmptyState
            title="No containers yet"
            message="When containers are created, they will show up here."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {containers.map((container) => (
              <ContainerCard
                key={container.id}
                container={container}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
