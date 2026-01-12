/**
 * API Routes: Vault Currencies collection
 * Vault scoped. Enforces vault ownership for the current user.
 */

import { NextResponse } from "next/server";
import { auth } from "@/app/_lib/auth";
import { assertVaultOwner } from "@/app/_lib/data/vaults.data";
import {
  createCurrencyForVault,
  getCurrenciesForVault,
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
 * Require a session and return userId.
 * @returns {Promise<string>}
 */
async function requireUserId() {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  const userId = session?.user?.userId;
  if (!userId) throw new Error("You must be logged in.");

  return userId;
}

/**
 * GET /api/vaults/:vaultId/currencies
 */
export async function GET(_request, context) {
  try {
    const userId = await requireUserId();

    const { vaultId } = await context.params;
    if (!vaultId)
      return json({ ok: false, error: "vaultId is required." }, 400);

    await assertVaultOwner(vaultId, userId);

    const data = await getCurrenciesForVault(vaultId);
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
 * POST /api/vaults/:vaultId/currencies
 */
export async function POST(request, context) {
  try {
    const userId = await requireUserId();

    const { vaultId } = await context.params;
    if (!vaultId)
      return json({ ok: false, error: "vaultId is required." }, 400);

    const payload = await request.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return json({ ok: false, error: "Invalid JSON body." }, 400);
    }
    if (!payload.name)
      return json({ ok: false, error: "name is required." }, 400);

    await assertVaultOwner(vaultId, userId);

    const data = await createCurrencyForVault(vaultId, payload);
    return json({ ok: true, data }, 201);
  } catch (err) {
    if (err?.message === "You must be logged in.")
      return json({ ok: false, error: err.message }, 401);
    if (err?.message === "Vault access denied.")
      return json({ ok: false, error: err.message }, 403);
    return json({ ok: false, error: err?.message || "Unexpected error." }, 500);
  }
}
