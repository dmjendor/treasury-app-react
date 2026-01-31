import { NextResponse } from "next/server";
import { auth } from "@/app/_lib/auth";
import { assertVaultOwner } from "@/app/_lib/data/vaults.data";
import {
  deleteTreasureForVaultById,
  getTreasureForVaultById,
  updateTreasureForVaultById,
} from "@/app/_lib/data/treasures.data";

/**
 * JSON response helper.
 * @param {any} body
 * @param {number} status
 */
function json(body, status = 200) {
  return NextResponse.json(body, { status });
}

/**
 *
 * - Fetch a treasure in a vault.
 * - @param {Request} _request
 * - @param {{ params: Promise<{ vaultId: string, treasureId: string }> }} context
 * - @returns {Promise<Response>}
 */
export async function GET(_request, { params }) {
  try {
    const session = await auth();
    if (!session)
      return json({ ok: false, error: "You must be logged in." }, 401);
    const userId = session.user.userId;

    const { vaultId, treasureId } = await params;
    if (!vaultId)
      return json({ ok: false, error: "vaultId is required." }, 400);
    if (!treasureId)
      return json({ ok: false, error: "treasureId is required." }, 400);

    const isOwner = await assertVaultOwner(vaultId, userId);
    if (!isOwner) return json({ ok: false, error: "Vault access denied." }, 403);

    const data = await getTreasureForVaultById(vaultId, treasureId);
    if (!data) return json({ ok: false, error: "Treasure not found." }, 404);

    return json({ ok: true, data });
  } catch (err) {
    return json({ ok: false, error: err?.message || "Unexpected error." }, 500);
  }
}

/**
 *
 * - Update a treasure in a vault.
 * - @param {Request} request
 * - @param {{ params: Promise<{ vaultId: string, treasureId: string }> }} context
 * - @returns {Promise<Response>}
 */
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session)
      return json({ ok: false, error: "You must be logged in." }, 401);

    const userId = session.user.userId;
    const { vaultId, treasureId } = await params;

    if (!vaultId)
      return json({ ok: false, error: "vaultId is required." }, 400);
    if (!treasureId)
      return json({ ok: false, error: "treasureId is required." }, 400);

    const updates = await request.json().catch(() => null);
    if (!updates || typeof updates !== "object") {
      return json({ ok: false, error: "Invalid JSON body." }, 400);
    }

    const isOwner = await assertVaultOwner(vaultId, userId);
    if (!isOwner) return json({ ok: false, error: "Vault access denied." }, 403);

    const updateResult = await updateTreasureForVaultById(
      vaultId,
      treasureId,
      updates,
    );
    if (!updateResult?.ok) {
      return json(
        { ok: false, error: updateResult?.error || "Treasure not found." },
        404,
      );
    }

    return json({ ok: true, data: updateResult.data?.after || null });
  } catch (err) {
    return json({ ok: false, error: err?.message || "Unexpected error." }, 500);
  }
}

/**
 *
 * - Delete a treasure in a vault.
 * - @param {Request} _request
 * - @param {{ params: Promise<{ vaultId: string, treasureId: string }> }} context
 * - @returns {Promise<Response>}
 */
export async function DELETE(_request, { params }) {
  try {
    const session = await auth();
    if (!session)
      return json({ ok: false, error: "You must be logged in." }, 401);

    const userId = session.user.userId;
    const { vaultId, treasureId } = await params;

    if (!vaultId)
      return json({ ok: false, error: "vaultId is required." }, 400);
    if (!treasureId)
      return json({ ok: false, error: "treasureId is required." }, 400);

    const isOwner = await assertVaultOwner(vaultId, userId);
    if (!isOwner) return json({ ok: false, error: "Vault access denied." }, 403);
    const deleted = await deleteTreasureForVaultById(vaultId, treasureId);
    if (!deleted) {
      return json({ ok: false, error: "Failed to delete treasure." }, 500);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err?.message || "Unexpected error." }, 500);
  }
}
