/**
 * API Routes: Vault Permissions collection
 * Vault scoped. Enforces vault ownership for the current user.
 */

import { NextResponse } from "next/server";
import { auth } from "@/app/_lib/auth";
import { assertVaultOwner } from "@/app/_lib/data/vaults.data";

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
  if (!session) return null;

  const userId = session?.user?.userId;
  if (!userId) return null;

  return userId;
}

/**
 * GET /api/vaults/:vaultId/permissions
 */
export async function GET(_request, context) {
  try {
    const userId = await requireUserId();
    if (!userId) return json({ ok: false, error: "You must be logged in." }, 401);

    const { vaultId } = await context.params;
    if (!vaultId)
      return json({ ok: false, error: "vaultId is required." }, 400);

    const isOwner = await assertVaultOwner(vaultId, userId);
    if (!isOwner) return json({ ok: false, error: "Vault access denied." }, 403);

    const data = await getTreasuresForVault(vaultId);
    return json({ ok: true, data });
  } catch (err) {
    return json({ ok: false, error: err?.message || "Unexpected error." }, 500);
  }
}
