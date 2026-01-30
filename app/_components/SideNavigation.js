"use client";
import SignOutButton from "./SignOutButton";
import { useParams, usePathname } from "next/navigation";
import {
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlinePlusCircle,
} from "react-icons/hi2";
import NavLink from "./NavLink";
import TwoCoinsIcon from "@/app/_components/icons/TwoCoinsIcon";
import BackpackIcon from "@/app/_components/icons/BackpackIcon";
import ChestIcon from "@/app/_components/icons/ChestIcon";
import ScrollQuillIcon from "@/app/_components/icons/ScrollQuillIcon";
import { useState } from "react";
import { NavButton } from "@/app/_components/NavButton";

import HoldingsIcon from "@/app/_components/icons/CashIcon";
import BattleGearIcon from "@/app/_components/icons/BattleGearIcon";
import GemsIcon from "@/app/_components/icons/GemsIcon";
import ScrollUnfurledIcon from "@/app/_components/icons/ScrollUnfurledIcon";
import MinionsIcon from "@/app/_components/icons/MinionsIcon";

function SideNavigation({ memberVaultLinks, userId, currentVault }) {
  const params = useParams();
  const pathname = usePathname();

  const vaultId = params?.vaultId; // available when route includes [vaultId]
  const inAccountVaultRoute = pathname?.startsWith("/account/vaults/");
  const inVault = Boolean(vaultId);
  const ownsCurrentVault =
    inVault &&
    inAccountVaultRoute &&
    Boolean(userId) &&
    (currentVault ? currentVault.user_id === userId : true);

  const [showTools, setShowTools] = useState(true);

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
        {/* Vault scoped (owner only) */}
        {ownsCurrentVault && (
          <div className="space-y-2">
            <NavButton
              variant="accent"
              onClick={() => setShowTools((s) => !s)}
              aria-expanded={showTools}
              iconRight={showTools ? HiOutlineChevronUp : HiOutlineChevronDown}
            >
              Current vault
            </NavButton>

            {showTools ? (
              <div className="space-y-2">
                <NavLink
                  href={`${vaultBase}`}
                  icon={ScrollUnfurledIcon}
                  label="Overview"
                  active={pathname === vaultBase}
                />

                <NavLink
                  href={`${vaultBase}/holdings`}
                  icon={HoldingsIcon}
                  label="Holdings"
                  active={pathname?.startsWith(`${vaultBase}/holdings`)}
                />

                <NavLink
                  href={`${vaultBase}/treasures`}
                  icon={BattleGearIcon}
                  label="Treasures"
                  active={pathname?.startsWith(`${vaultBase}/treasures`)}
                />

                <NavLink
                  href={`${vaultBase}/valuables`}
                  icon={GemsIcon}
                  label="Valuables"
                  active={pathname?.startsWith(`${vaultBase}/valuables`)}
                />
                <hr />
                <NavLink
                  href={`${vaultBase}/preprewards`}
                  icon={ScrollQuillIcon}
                  label="Prepare Rewards"
                  active={pathname?.startsWith(`${vaultBase}/preprewards`)}
                />

                <NavLink
                  href={`${vaultBase}/containers`}
                  icon={BackpackIcon}
                  label="Containers"
                  active={pathname?.startsWith(`${vaultBase}/containers`)}
                />

                <NavLink
                  href={`${vaultBase}/currencies`}
                  icon={TwoCoinsIcon}
                  label="Currencies"
                  active={pathname?.startsWith(`${vaultBase}/currencies`)}
                />

                <NavLink
                  href={`${vaultBase}/members`}
                  icon={MinionsIcon}
                  label="Members"
                  active={pathname?.startsWith(`${vaultBase}/members`)}
                />

                <NavLink
                  href={`${vaultBase}/logs`}
                  icon="ra-eyeball"
                  label="Logs"
                  active={pathname?.startsWith(`${vaultBase}/logs`)}
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
                  active={pathname?.startsWith(`${vaultBase}/settings`)}
                />
              </div>
            ) : null}
          </div>
        )}

        {memberVaultLinks && (
          <div className="space-y-2">
            <div className="px-3 text-xs uppercase tracking-wide text-muted-fg">
              Vaults
            </div>
            {memberVaultLinks.map((link) => {
              return (
                <NavLink
                  key={link.id}
                  href={link.href}
                  icon={ChestIcon}
                  label={link.name}
                  className="text-accent-700"
                  active={pathname?.startsWith("/public/vaults/")}
                />
              );
            })}
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
