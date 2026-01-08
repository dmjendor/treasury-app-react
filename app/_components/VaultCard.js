import Link from "next/link";
import {
  HiOutlineArchiveBox,
  HiOutlineGift,
  HiOutlineCurrencyDollar,
  HiOutlineSparkles,
  HiOutlineBookOpen,
  HiOutlineSwatch,
  HiOutlinePencilSquare,
  HiOutlineArrowRight,
} from "react-icons/hi2";

function VaultCard({ vault }) {
  const {
    id,
    active,
    edition,
    name,
    theme,
    containers_count,
    treasure_count,
    currencies_count,
    valuables_count,
  } = vault;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface-800/70 p-6 shadow-sm backdrop-blur">
      {/* subtle highlight */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-56 w-56 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-ink-900">
              {name || "Untitled Vault"}
            </h3>

            <div className="mt-2 flex flex-wrap gap-2">
              <Pill
                icon={HiOutlineBookOpen}
                text={edition || "Edition"}
              />
              <Pill
                icon={HiOutlineSwatch}
                text={theme || "Theme"}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/account/vaults/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-ink-800 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              aria-label={`Edit ${name ?? "vault"}`}
            >
              <HiOutlinePencilSquare className="h-5 w-5" />
              <span className="hidden sm:inline">Edit</span>
            </Link>

            <Link
              href={`/account/vaults/${id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              aria-label={`View ${name ?? "vault"}`}
            >
              <span className="hidden sm:inline">View</span>
              <HiOutlineArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            icon={HiOutlineArchiveBox}
            label="Containers"
            value={containers_count}
          />
          <Stat
            icon={HiOutlineGift}
            label="Treasure"
            value={treasure_count}
          />
          <Stat
            icon={HiOutlineCurrencyDollar}
            label="Currencies"
            value={currencies_count}
          />
          <Stat
            icon={HiOutlineSparkles}
            label="Valuables"
            value={valuables_count}
          />
        </div>

        {/* Footer note (optional) */}
        <div className="mt-5 flex items-center justify-between text-xs text-ink-600">
          <span className="truncate">
            Last updated:{" "}
            {vault.updated_at
              ? new Date(vault.updated_at).toLocaleDateString()
              : "Unknown"}
          </span>
          <span className="text-ink-700 opacity-0 transition-opacity group-hover:opacity-100">
            Open vault
          </span>
        </div>
      </div>
    </div>
  );
}

export default VaultCard;

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
      <Icon className="h-4 w-4 text-ink-700" />
      <div className="leading-tight">
        <div className="text-xs text-ink-600">{label}</div>
        <div className="text-sm font-semibold text-ink-900">{value ?? 0}</div>
      </div>
    </div>
  );
}

function Pill({ icon: Icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-ink-700">
      <Icon className="h-4 w-4" />
      <span className="truncate">{text || "Unknown"}</span>
    </div>
  );
}
