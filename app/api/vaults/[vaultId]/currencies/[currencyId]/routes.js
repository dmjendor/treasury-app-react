/**
 * API Routes: Vault Currency item
 * Thin handler: auth + validation + calls data service.
 */

import { NextResponse } from "next/server";
import { auth } from "@/app/_lib/auth";
import { assertVaultOwner } from "@/app/_lib/data/vaults.data";
import {
  deleteCurrencyForVaultById,
  getCurrencyForVaultById,
  updateCurrencyForVaultById,
} from "@/app/_lib/data/currencies.data";

/**
 * JSON response helper.
 * @param {any} body
 * @param {number} status
 */
function json(body, status = 200) {
  return NextResponse.json(body, { status });
}

/**
 * GET /api/vaults/:vaultId/currencies/:currencyId
 */
export async function GET(_request, { params }) {
  try {
    const session = await auth();
    if (!session) throw new Error("You must be logged in.");

    const userId = session.user.userId;
    const vaultId = params?.vaultId;
    const currencyId = params?.currencyId;

    if (!vaultId)
      return json({ ok: false, error: "vaultId is required." }, 400);
    if (!currencyId)
      return json({ ok: false, error: "currencyId is required." }, 400);

    await assertVaultOwner(vaultId, userId);

    const data = await getCurrencyForVaultById(vaultId, currencyId);
    if (!data) return json({ ok: false, error: "Currency not found." }, 404);

    return json({ ok: true, data });
  } catch (err) {
    if (err?.message === "You must be logged in.")
      return json({ ok: false, error: err.message }, 401);
    if (err?.message === "Vault access denied.")
      return json({ ok: false, error: err.message }, 403);
    return json({ ok: false, error: err?.message || "Unexpected error." }, 500);
  }
}

/**
 * PATCH /api/vaults/:vaultId/currencies/:currencyId
 */
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session) throw new Error("You must be logged in.");

    const userId = session.user.userId;
    const vaultId = params?.vaultId;
    const currencyId = params?.currencyId;

    if (!vaultId)
      return json({ ok: false, error: "vaultId is required." }, 400);
    if (!currencyId)
      return json({ ok: false, error: "currencyId is required." }, 400);

    const updates = await request.json().catch(() => null);
    if (!updates || typeof updates !== "object") {
      return json({ ok: false, error: "Invalid JSON body." }, 400);
    }

    await assertVaultOwner(vaultId, userId);

    const data = await updateCurrencyForVaultById(vaultId, currencyId, updates);
    if (!data) return json({ ok: false, error: "Currency not found." }, 404);

    return json({ ok: true, data });
  } catch (err) {
    if (err?.message === "You must be logged in.")
      return json({ ok: false, error: err.message }, 401);
    if (err?.message === "Vault access denied.")
      return json({ ok: false, error: err.message }, 403);
    return json({ ok: false, error: err?.message || "Unexpected error." }, 500);
  }
}

/**
 * DELETE /api/vaults/:vaultId/currencies/:currencyId
 */
export async function DELETE(_request, { params }) {
  try {
    const session = await auth();
    if (!session) throw new Error("You must be logged in.");

    const userId = session.user.userId;
    const vaultId = params?.vaultId;
    const currencyId = params?.currencyId;

    if (!vaultId)
      return json({ ok: false, error: "vaultId is required." }, 400);
    if (!currencyId)
      return json({ ok: false, error: "currencyId is required." }, 400);

    await assertVaultOwner(vaultId, userId);
    await deleteCurrencyForVaultById(vaultId, currencyId);

    return json({ ok: true });
  } catch (err) {
    if (err?.message === "You must be logged in.")
      return json({ ok: false, error: err.message }, 401);
    if (err?.message === "Vault access denied.")
      return json({ ok: false, error: err.message }, 403);
    return json({ ok: false, error: err?.message || "Unexpected error." }, 500);
  }
}
