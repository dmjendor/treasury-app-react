"use client";
import { HiHome } from "react-icons/hi";
import SignOutButton from "./SignOutButton";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  HiOutlineArchiveBox,
  HiOutlineBookOpen,
  HiOutlineBuildingLibrary,
  HiOutlineCog6Tooth,
  HiOutlineCurrencyDollar,
  HiOutlineGift,
  HiOutlineSparkles,
} from "react-icons/hi2";

const navLinks = [
  {
    name: "Home",
    href: "/account",
    icon: <HiHome className="h-5 w-5 text-primary-600" />,
  },
  {
    name: "Vaults",
    href: "/account/vaults",
    icon: <HiOutlineBuildingLibrary className="h-5 w-5 text-primary-600" />,
  },
  {
    name: "Containers",
    href: "/account/vaults/[vaultId]/containers",
    icon: <HiOutlineArchiveBox className="h-5 w-5 text-primary-600" />,
  },
  {
    name: "Currencies",
    href: "/account/profile",
    icon: <HiOutlineCurrencyDollar className="h-5 w-5 text-primary-600" />,
  },
  {
    name: "Treasures",
    href: "/account/profile",
    icon: <HiOutlineGift className="h-5 w-5 text-primary-600" />,
  },
  {
    name: "Valuables",
    href: "/account/profile",
    icon: <HiOutlineSparkles className="h-5 w-5 text-primary-600" />,
  },
  {
    name: "Editions",
    href: "/account/profile",
    icon: <HiOutlineBookOpen className="h-5 w-5 text-primary-600" />,
  },
  {
    name: "Settings",
    href: "/account/profile",
    icon: <HiOutlineCog6Tooth className="h-5 w-5 text-primary-600" />,
  },
];

function SideNavigation() {
  const params = useParams();
  const pathname = usePathname();

  const vaultId = params?.vaultId; // available when route includes [vaultId]
  const inVault = Boolean(vaultId);

  const vaultBase = inVault
    ? `/account/vaults/${encodeURIComponent(vaultId)}`
    : null;

  return (
    <nav className="border-r border-primary-900">
      <ul className="flex flex-col gap-2 h-full text-lg">
        {/* {navLinks.map((link) => (
          <li key={link.name}>
            <Link
              className={`py-3 px-5 hover:bg-primary-900 hover:text-primary-100 transition-colors flex items-center gap-4 font-semibold text-primary-200 ${
                pathname === link.href ? "bg-primary-900" : ""
              }`}
              href={link.href}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          </li>
        ))} */}
        <NavLink
          href="/account/vaults"
          icon={HiOutlineBuildingLibrary}
          label="Vaults"
          active={pathname?.startsWith("/account/vaults")}
        />
        {/* Vault scoped */}
        {inVault && (
          <div className="space-y-2">
            <div className="px-3 text-xs uppercase tracking-wide text-ink-600">
              Current vault
            </div>

            <NavLink
              href={`${vaultBase}`}
              icon={HiOutlineBuildingLibrary}
              label="Overview"
              active={pathname === vaultBase}
            />

            <NavLink
              href={`${vaultBase}/containers`}
              icon={HiOutlineArchiveBox}
              label="Containers"
              active={pathname?.startsWith(`${vaultBase}/containers`)}
            />

            <NavLink
              href={`${vaultBase}/treasure`}
              icon={HiOutlineGift}
              label="Treasure"
              active={pathname?.startsWith(`${vaultBase}/treasure`)}
            />

            <NavLink
              href={`${vaultBase}/currencies`}
              icon={HiOutlineCurrencyDollar}
              label="Currencies"
              active={pathname?.startsWith(`${vaultBase}/currencies`)}
            />

            <NavLink
              href={`${vaultBase}/valuables`}
              icon={HiOutlineSparkles}
              label="Valuables"
              active={pathname?.startsWith(`${vaultBase}/valuables`)}
            />
          </div>
        )}
        <NavLink
          href="/account/settings"
          icon={HiOutlineCog6Tooth}
          label="Settings"
          active={pathname === "/account/settings"}
        />
        <li className="mt-auto">
          <SignOutButton />
        </li>
      </ul>
    </nav>
  );
}

export default SideNavigation;

function NavLink({ href, icon: Icon, label, active }) {
  return (
    <Link
      href={href}
      className={`py-3 px-5 hover:bg-primary-900 hover:text-primary-100 transition-colors flex items-center gap-4 font-semibold text-primary-200 ${
        active ? "bg-primary-900" : ""
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
