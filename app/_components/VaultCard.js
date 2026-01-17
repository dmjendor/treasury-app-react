import IconComponent from "@/app/_components/IconComponent";
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
    name,
    system_id,
    theme_id,
    system,
    theme,
    containers_count,
    treasure_count,
    currencies_count,
    valuables_count,
  } = vault;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm backdrop-blur">
      {/* subtle highlight */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary-500 opacity-10 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-56 w-56 rounded-full bg-accent-500 opacity-10 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-fg">
              {name || "Untitled Vault"}
            </h3>

            <div className="mt-2 flex flex-wrap gap-2">
              <Pill
                icon={HiOutlineBookOpen}
                text={vault?.system?.name || "Game System"}
              />
              <Pill
                icon={HiOutlineSwatch}
                text={vault?.theme?.name || "Theme"}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/account/vaults/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl bg-btn-secondary-bg px-3 py-2 text-sm text-btn-secondary-fg hover:bg-btn-secondary-hover-bg focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={`Edit ${name ?? "vault"}`}
            >
              <HiOutlinePencilSquare className="h-5 w-5" />
              <span className="hidden sm:inline">Edit</span>
            </Link>

            <Link
              href={`/account/vaults/${id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-btn-primary-bg px-3 py-2 text-sm font-semibold text-btn-primary-fg hover:bg-btn-primary-hover-bg focus:outline-none focus:ring-2 focus:ring-accent"
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
            icon={"/svg/backpack.svg"}
            label="Containers"
            value={containers_count}
          />
          <Stat
            icon={"ra-sword"}
            label="Treasure"
            value={treasure_count}
          />
          <Stat
            icon={"/svg/two-coins.svg"}
            label="Currencies"
            value={currencies_count}
          />
          <Stat
            icon={"ra-diamond"}
            label="Valuables"
            value={valuables_count}
          />
        </div>

        {/* Footer note (optional) */}
        <div className="mt-5 flex items-center justify-between text-xs text-muted-fg">
          <span className="truncate">
            Last updated:{" "}
            {vault.updated_at
              ? new Date(vault.updated_at).toLocaleDateString()
              : "Unknown"}
          </span>
          <span className="text-muted-fg opacity-0 transition-opacity group-hover:opacity-100">
            Open vault
          </span>
        </div>
      </div>
    </div>
  );
}

export default VaultCard;

function Stat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2">
      <IconComponent icon={icon} />
      <div className="leading-tight">
        <div className="text-xs text-muted-fg">{label}</div>
        <div className="text-sm font-semibold text-fg">{value ?? 0}</div>
      </div>
    </div>
  );
}

function Pill({ icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs text-muted-fg">
      <IconComponent icon={icon} />
      <span className="truncate">{text || "Unknown"}</span>
    </div>
  );
}
