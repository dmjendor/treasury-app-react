import IconComponent from "@/app/_components/IconComponent";
import BackpackIcon from "@/app/_components/icons/BackpackIcon";
import TwoCoinsIcon from "@/app/_components/icons/TwoCoinsIcon";
import Link from "next/link";
import {
  HiOutlineBookOpen,
  HiOutlineSwatch,
  HiOutlinePencilSquare,
  HiOutlineArrowRight,
} from "react-icons/hi2";

function VaultCard({ vault }) {
  const {
    id,
    name,
    theme,
    system,
    containers_count,
    treasures_count,
    currencies_count,
    valuables_count,
    updated_at,
  } = vault;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm backdrop-blur theme-${theme?.theme_key || "night"}`}
    >
      {/* accent wash + border shimmer */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-28 -right-28 h-72 w-72 rounded-full bg-accent/12 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* inner frame that can pick up accent */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-border transition-colors duration-300 group-hover:ring-accent/40" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-fg">
              {name || "Untitled Vault"}
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              <Pill
                icon={HiOutlineBookOpen}
                text={system?.name || "Game System"}
              />
              <Pill
                icon={HiOutlineSwatch}
                text={theme?.name || "Theme"}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/account/vaults/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-fg transition-colors hover:bg-surface hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={`Edit ${name ?? "vault"}`}
            >
              <IconComponent
                icon={HiOutlinePencilSquare}
                title="Edit"
              />
              <span className="hidden sm:inline">Edit</span>
            </Link>

            <Link
              href={`/account/vaults/${id}`}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-fg transition-colors hover:bg-surface hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={`View ${name ?? "vault"}`}
            >
              <span className="hidden sm:inline">View</span>
              <IconComponent
                icon={HiOutlineArrowRight}
                title="View"
              />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            icon={BackpackIcon}
            label="Containers"
            value={containers_count}
          />
          <Stat
            icon="ra-sword"
            label="Treasure"
            value={treasures_count}
          />
          <Stat
            icon={TwoCoinsIcon}
            label="Currencies"
            value={currencies_count}
          />
          <Stat
            icon="ra-diamond"
            label="Valuables"
            value={valuables_count}
          />
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between text-xs text-muted-fg">
          <span className="truncate">
            Last updated:{" "}
            {updated_at ? new Date(updated_at).toLocaleDateString() : "Unknown"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default VaultCard;

function Stat({ icon, label, value }) {
  return (
    <div className="group/stat flex items-center gap-2 rounded-xl border border-accent-700 bg-accent-600 px-3 py-2 transition-colors">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-100 text-accent-800 ring-1 ring-inset ring-accent-200 transition-colors group-hover/stat:bg-accent-200">
        <IconComponent
          icon={icon}
          variant="inherit"
        />
      </div>

      <div className="leading-tight">
        <div className="text-xs text-accent-100">{label}</div>
        <div className="text-sm font-semibold text-accent-950">
          {value ?? 0}
        </div>
      </div>
    </div>
  );
}

function Pill({ icon, text }) {
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-accent-700 bg-accent-600 px-3 py-1 text-xs ring-1 ring-inset ring-accent-700 transition-colors text-accent-50">
      <span className="text-accent-50">
        <IconComponent
          icon={icon}
          variant="accent"
        />
      </span>
      <span className="truncate text-accent-50">{text || "Unknown"}</span>
    </div>
  );
}
