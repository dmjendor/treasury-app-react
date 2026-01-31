/**
 * API Routes: Vault detail.
 */

import { NextResponse } from "next/server";
import { auth } from "@/app/_lib/auth";
import { assertVaultOwner, getVaultById } from "@/app/_lib/data/vaults.data";

export const dynamic = "force-dynamic";

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
- Get a vault by id.
- @param {{ params: { vaultId: string } }} context
- @returns {Promise<Response>}
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

    const vault = await getVaultById(vaultId);
    if (!vault) return json({ ok: false, error: "Vault not found." }, 404);

    return json({ ok: true, data: vault });
  } catch (err) {
    return json({ ok: false, error: err?.message || "Unexpected error." }, 500);
  }
}
