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
  if (!session) throw new Error("You must be logged in.");

  const userId = session?.user?.userId;
  if (!userId) throw new Error("You must be logged in.");

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
    const { vaultId } = await context.params;

    if (!vaultId)
      return json({ ok: false, error: "vaultId is required." }, 400);

    await assertVaultOwner(vaultId, userId);
    const vault = await getVaultById(vaultId);

    return json({ ok: true, data: vault });
  } catch (err) {
    if (err?.message === "You must be logged in.")
      return json({ ok: false, error: err.message }, 401);
    if (err?.message === "Vault access denied.")
      return json({ ok: false, error: err.message }, 403);
    return json({ ok: false, error: err?.message || "Unexpected error." }, 500);
  }
}
