import Link from "next/link";
import {
  HiOutlineArchiveBox,
  HiOutlineGift,
  HiOutlineSparkles,
  HiOutlinePencilSquare,
  HiOutlineArrowRight,
} from "react-icons/hi2";

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-ink-700">
      <Icon className="h-4 w-4" />
      <span className="font-semibold text-ink-900">{value ?? 0}</span>
      <span className="text-ink-600">{label}</span>
    </div>
  );
}

export default function ContainerCard({ container, vaultId }) {
  const treasuresCount =
    container.treasures_count ?? container.treasures?.[0]?.count ?? 0;

  const valuablesCount =
    container.valuables_count ?? container.valuables?.[0]?.count ?? 0;

  const name = container.name || "Unnamed container";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface-800/70 p-6 shadow-sm backdrop-blur">
      {/* subtle hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary-500/10 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-white/5 p-2">
                <HiOutlineArchiveBox className="h-5 w-5 text-ink-700" />
              </div>
              <h3 className="truncate text-lg font-semibold text-ink-900">
                {name}
              </h3>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <StatPill
                icon={HiOutlineGift}
                label="treasures"
                value={treasuresCount}
              />
              <StatPill
                icon={HiOutlineSparkles}
                label="valuables"
                value={valuablesCount}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/account/vaults/${encodeURIComponent(
                vaultId
              )}/containers/${encodeURIComponent(container.id)}/edit`}
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-ink-800 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              aria-label={`Edit ${name}`}
            >
              <HiOutlinePencilSquare className="h-5 w-5" />
              <span className="hidden sm:inline">Edit</span>
            </Link>

            <Link
              href={`/account/vaults/${encodeURIComponent(
                vaultId
              )}/containers/${encodeURIComponent(container.id)}`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              aria-label={`View ${name}`}
            >
              <span className="hidden sm:inline">View</span>
              <HiOutlineArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
