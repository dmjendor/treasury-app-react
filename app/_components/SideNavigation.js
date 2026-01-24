"use client";
import { HiHome } from "react-icons/hi";
import SignOutButton from "./SignOutButton";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { HiOutlinePlusCircle } from "react-icons/hi2";
import NavLink from "./NavLink";
import TwoCoinsIcon from "@/app/_components/icons/TwoCoinsIcon";
import BackpackIcon from "@/app/_components/icons/BackpackIcon";
import ChestIcon from "@/app/_components/icons/ChestIcon";

function SideNavigation() {
  const params = useParams();
  const pathname = usePathname();

  const vaultId = params?.vaultId; // available when route includes [vaultId]
  const inVault = Boolean(vaultId);

  const vaultBase = inVault
    ? `/account/vaults/${encodeURIComponent(vaultId)}`
    : null;

  return (
    <nav className="border-r border-border">
      <ul className="flex flex-col gap-2 h-full text-lg text-accent-50">
        <NavLink
          href="/account/vaults"
          icon={ChestIcon}
          label="My Vaults"
          active={pathname?.startsWith("/account/vaults")}
        />
        {/* Link Scoped */}
        {pathname === "/account/vaults" && !inVault ? (
          <NavLink
            href="/account/vaults/new"
            icon={HiOutlinePlusCircle}
            label="New Vault"
            active={pathname?.startsWith("/account/vaults/new")}
          />
        ) : (
          ""
        )}
        {/* Vault scoped */}
        {inVault && (
          <div className="space-y-2">
            <div className="px-3 text-xs uppercase tracking-wide text-muted-fg">
              Current vault
            </div>

            <NavLink
              href={`${vaultBase}`}
              icon="ra-scroll-unfurled"
              label="Overview"
              active={pathname === vaultBase}
            />

            <NavLink
              href={`${vaultBase}/containers`}
              icon={BackpackIcon}
              label="Containers"
              active={pathname?.startsWith(`${vaultBase}/containers`)}
            />

            <NavLink
              href={`${vaultBase}/treasures`}
              icon="ra-sword"
              label="Treasures"
              active={pathname?.startsWith(`${vaultBase}/treasures`)}
            />

            <NavLink
              href={`${vaultBase}/valuables`}
              icon="ra-diamond"
              label="Valuables"
              active={pathname?.startsWith(`${vaultBase}/valuables`)}
            />

            <NavLink
              href={`${vaultBase}/currencies`}
              icon={TwoCoinsIcon}
              label="Currencies"
              active={pathname?.startsWith(`${vaultBase}/currencies`)}
            />

            <NavLink
              href={`${vaultBase}/members`}
              icon="ra-double-team"
              label="Members"
              active={pathname?.startsWith(`${vaultBase}/members`)}
            />

            <NavLink
              href={`${vaultBase}/permissions`}
              icon="ra-three-keys"
              label="Permissions"
              active={pathname?.startsWith(`${vaultBase}/permissions`)}
            />

            <NavLink
              href={`${vaultBase}/settings`}
              icon="ra-cog"
              label="Settings"
              active={pathname === "/account/settings"}
            />
          </div>
        )}
        <li className="mt-auto">
          <SignOutButton />
        </li>
      </ul>
    </nav>
  );
}

export default SideNavigation;
