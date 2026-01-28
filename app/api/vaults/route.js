import { NextResponse } from "next/server";
import { auth } from "@/app/_lib/auth";
import { createVault } from "@/app/_lib/data/vaults.data";
import { createOwnerPermission } from "@/app/_lib/data/permissions.data";

function toBool(v) {
  return v === true || v === "true" || v === "on" || v === "1";
}

function toNumber(v, fallback = 0) {
  if (v === "" || v == null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.userId) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 },
      );
    }

    const userId = session.user.userId;
    const body = await req.json();

    // Minimal validation
    if (!body.name || body.name.trim().length < 2) {
      return NextResponse.json(
        { error: "Vault name must be at least 2 characters." },
        { status: 400 }
      );
    }

    const payload = {
      name: body.name.trim(),
      user_id: userId,

      // IDs are optional for now
      system_id: body.system_id || null,
      theme_id: body.theme_id || null,

      // Transfer permissions
      allow_xfer_in: toBool(body.allow_xfer_in),
      allow_xfer_out: toBool(body.allow_xfer_out),

      // Currency behavior
      base_currency_id: body.base_currency_id || null,
      common_currency_id: body.common_currency_id || null,
      merge_split: body.merge_split === "base" ? "base" : "per_currency",

      // Feature toggles
      treasury_split_enabled: toBool(body.treasury_split_enabled),
      reward_prep_enabled: toBool(body.reward_prep_enabled),

      // Markups (percent)
      vo_buy_markup: toNumber(body.vo_buy_markup, 0),
      vo_sell_markup: toNumber(body.vo_sell_markup, 0),
      item_buy_markup: toNumber(body.item_buy_markup, 0),
      item_sell_markup: toNumber(body.item_sell_markup, 0),
    };

    const created = await createVault(payload);
    const permissionRes = await createOwnerPermission({
      vaultId: created?.id,
      userId,
    });

    if (!permissionRes.ok) {
      return NextResponse.json(
        { error: permissionRes.error || "Failed to add owner permission." },
        { status: 500 },
      );
    }

    return NextResponse.json({ vault: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create vault." },
      { status: 500 },
      { message: err }
    );
  }
}
