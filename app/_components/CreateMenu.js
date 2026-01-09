/**
 * Global "Create" menu for the current vault.
 *
 * Lives in the VaultHeader and provides quick access to create
 * containers, treasure, currencies, etc, without cluttering the sidebar.
 * Uses simple client-side state to toggle visibility and closes on outside click.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ImgIcon from "@/app/_components/ImgIcon";
import RaIcon from "@/app/_components/RaIcon";

/**
 * Determines whether an icon value is a path to an image asset.
 */
function isSvgPath(icon) {
  return (
    typeof icon === "string" &&
    icon.startsWith("/") &&
    (icon.endsWith(".svg") || icon.endsWith(".png") || icon.endsWith(".webp"))
  );
}

/**
 * Determines whether an icon value is a path to an image asset.
 */
function isRAIcon(icon) {
  return typeof icon === "string" && icon.startsWith("ra");
}

/**
 * Determines whether an icon value is a React component (e.g. HeroIcon).
 */
function isReactIcon(icon) {
  return typeof icon === "function";
}

/**
 * Renders the appropriate icon type based on the icon input.
 */
function IconSlot({ icon }) {
  if (isSvgPath(icon)) {
    return (
      <ImgIcon
        src={icon}
        className="h-5 w-5 opacity-80"
      />
    );
  }

  if (isRAIcon(icon)) {
    return (
      <RaIcon
        name={icon}
        className="text-lg opacity-80"
      />
    );
  }

  if (isReactIcon(icon)) {
    const IconComponent = icon;
    return <IconComponent className="h-5 w-5 opacity-80" />;
  }

  return (
    <span
      className="h-5 w-5"
      aria-hidden="true"
    />
  );
}

/**
 * Hook that calls `handler` when the user clicks outside of the given element.
 */
function useOutsideClick(ref, handler) {
  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) handler();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [ref, handler]);
}

/**
 * Individual menu item inside the Create dropdown.
 */
function MenuItem({ href, label, icon, onSelect }) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-800 hover:bg-white/10"
    >
      <IconSlot icon={icon} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

/**
 * Dropdown menu for creating new entities within a vault.
 */
export default function CreateMenu({ vaultId }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const base = `/account/vaults/${encodeURIComponent(vaultId)}`;

  const items = [
    {
      label: "New container",
      href: `${base}/containers/new`,
      icon: "/svg/backpack.svg",
    },
    {
      label: "New treasure",
      href: `${base}/treasure/new`,
      icon: "ra ra-sword",
    },
    {
      label: "New currency",
      href: `${base}/currencies/new`,
      icon: "/svg/two-coins.svg",
    },
    {
      label: "New valuable",
      href: `${base}/valuables/new`,
      icon: "ra ra-gem",
    },
  ];

  return (
    <div
      className="relative"
      ref={ref}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>+ Create</span>
        <span className="text-xs opacity-80">▾</span>
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-white/10 bg-surface-900/95 p-2 shadow-lg backdrop-blur"
          role="menu"
        >
          {items.map((item) => (
            <MenuItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              onSelect={() => setOpen(false)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
