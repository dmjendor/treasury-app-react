// app/api/vaults/[vaultId]/valuables/[valuableId]/route.js

import { NextResponse } from "next/server";
import { auth } from "@/app/_lib/auth";
import { assertVaultOwner } from "@/app/_lib/data/vaults.data";
import {
  deleteValuableForVaultById,
  getValuableForVaultById,
  updateValuableForVaultById,
} from "@/app/_lib/data/valuables.data";

function json(body, status = 200) {
  return NextResponse.json(body, { status });
}

/**
 * - Fetch a valuable in a vault.
 * - @param {Request} _request
 * - @param {{ params: Promise<{ vaultId: string, valuableId: string }> }} context
 * - @returns {Promise<Response>}
 */
export async function GET(_request, { params }) {
  try {
    const session = await auth();
    if (!session)
      return json({ ok: false, error: "You must be logged in." }, 401);
    const userId = session.user.userId;

    const { vaultId, valuableId } = await params;
    if (!vaultId)
      return json({ ok: false, error: "vaultId is required." }, 400);
    if (!valuableId)
      return json({ ok: false, error: "valuableId is required." }, 400);

    const isOwner = await assertVaultOwner(vaultId, userId);
    if (!isOwner) return json({ ok: false, error: "Vault access denied." }, 403);

    const data = await getValuableForVaultById(vaultId, valuableId);
    if (!data) return json({ ok: false, error: "Valuable not found." }, 404);

    return json({ ok: true, data });
  } catch (err) {
    return json({ ok: false, error: err?.message || "Unexpected error." }, 500);
  }
}

/**
 * - Update a valuable in a vault.
 * - @param {Request} request
 * - @param {{ params: Promise<{ vaultId: string, valuableId: string }> }} context
 * - @returns {Promise<Response>}
 */
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session)
      return json({ ok: false, error: "You must be logged in." }, 401);

    const userId = session.user.userId;
    const { vaultId, valuableId } = await params;

    if (!vaultId)
      return json({ ok: false, error: "vaultId is required." }, 400);
    if (!valuableId)
      return json({ ok: false, error: "valuableId is required." }, 400);

    const updates = await request.json().catch(() => null);
    if (!updates || typeof updates !== "object") {
      return json({ ok: false, error: "Invalid JSON body." }, 400);
    }

    const isOwner = await assertVaultOwner(vaultId, userId);
    if (!isOwner) return json({ ok: false, error: "Vault access denied." }, 403);

    const updateResult = await updateValuableForVaultById(
      vaultId,
      valuableId,
      updates,
    );
    if (!updateResult?.ok) {
      if (updateResult?.error?.includes("0 rows")) {
        return json({ ok: false, error: "Valuable not found." }, 404);
      }
      return json(
        { ok: false, error: updateResult?.error || "Update failed." },
        400,
      );
    }

    return json({ ok: true, data: updateResult.data?.after || null });
  } catch (err) {
    return json({ ok: false, error: err?.message || "Unexpected error." }, 500);
  }
}

/**
 * - Delete a valuable in a vault.
 * - @param {Request} _request
 * - @param {{ params: Promise<{ vaultId: string, valuableId: string }> }} context
 * - @returns {Promise<Response>}
 */
export async function DELETE(_request, { params }) {
  try {
    const session = await auth();
    if (!session)
      return json({ ok: false, error: "You must be logged in." }, 401);

    const userId = session.user.userId;
    const { vaultId, valuableId } = await params;

    if (!vaultId)
      return json({ ok: false, error: "vaultId is required." }, 400);
    if (!valuableId)
      return json({ ok: false, error: "valuableId is required." }, 400);

    const isOwner = await assertVaultOwner(vaultId, userId);
    if (!isOwner) return json({ ok: false, error: "Vault access denied." }, 403);
    const deleted = await deleteValuableForVaultById(vaultId, valuableId);
    if (!deleted) {
      return json({ ok: false, error: "Failed to delete valuable." }, 500);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err?.message || "Unexpected error." }, 500);
  }
}
