"use server";

import {
  createTreasureDb,
  getDefaultTreasures,
  getTreasureForVaultById,
  transferTreasureToVault,
  updateTreasureForVaultById,
} from "@/app/_lib/data/treasures.data";
import { tryCreateVaultLog } from "@/app/_lib/data/logs.data";
import { buildVaultLogInput } from "@/app/_lib/logging/createVaultLog";
import { auth } from "@/app/_lib/auth";
import { getContainersForVault } from "@/app/_lib/data/containers.data";
import { getPermissionByVaultAndUserId } from "@/app/_lib/data/permissions.data";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { revalidatePath } from "next/cache";

export async function createTreasureAction(payload) {
  const created = await createTreasureDb(payload);
  const createdTreasure = Array.isArray(created) ? created[0] : null;

  if (!createdTreasure) {
    return { ok: false, error: "Create treasure failed.", data: null };
  }

  const logInput = await buildVaultLogInput({
    vaultId: createdTreasure.vault_id,
    source: "treasures",
    action: "create",
    entityType: "treasures",
    entityId: createdTreasure.id,
    after: createdTreasure,
    message: `Treasure ${createdTreasure.name} created`,
  });

  await safeCreateVaultLog({ tryCreateVaultLog, input: logInput });

  return { ok: true, error: null, data: createdTreasure };
}

export async function getDefaultTreasuresAction({ vaultId }) {
  if (!vaultId) return { ok: false, error: "Missing vaultId", data: null };

  const rows = await getDefaultTreasures(vaultId);
  return { ok: true, error: null, data: Array.isArray(rows) ? rows : [] };
}

/**
 * - Get a treasure for a vault by id.
 * @param {{ vaultId: string, treasureId: string }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: any }>}
 */
export async function getTreasureForVaultByIdAction({ vaultId, treasureId }) {
  if (!vaultId || !treasureId) {
    return { ok: false, error: "Missing treasure id.", data: null };
  }

  const data = await getTreasureForVaultById(vaultId, treasureId);
  if (!data) {
    return { ok: false, error: "Treasure not found.", data: null };
  }
  return { ok: true, error: null, data };
}

export async function updateTreasureAction({ id, vaultId, patch }) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false, error: "You must be logged in.", data: null };
    }

    if (!id) return { ok: false, error: "Missing treasure id.", data: null };
    if (!vaultId) return { ok: false, error: "Missing vault id.", data: null };
    if (!patch || typeof patch !== "object") {
      return { ok: false, error: "Missing treasure updates.", data: null };
    }

    const updateResult = await updateTreasureForVaultById(vaultId, id, patch);

    if (!updateResult.ok) {
      return {
        ok: false,
        error: updateResult.error || "Update treasure failed.",
        data: null,
      };
    }

    const { before, after } = updateResult.data;

    const logInput = await buildVaultLogInput({
      vaultId,
      source: "treasures",
      action: "update",
      entityType: "treasures",
      entityId: id,
      before,
      after,
      labels: {
        name: "Name",
        description: "Description",
        value: "Value",
      },
      message: `Treasure ${after.name} updated`,
    });

    await safeCreateVaultLog({ tryCreateVaultLog, input: logInput });

    return { ok: true, error: null, data: after };
  } catch (error) {
    return {
      ok: false,
      error: error?.message || "Update treasure failed.",
      data: null,
    };
  }
}

/**
 * - Move a treasure to a new container.
 * @param {{ vaultId: string, treasureId: string, treasureName?: string, containerId: string, fromContainerName?: string, toContainerName?: string }} input
 * @returns {Promise<{ ok: boolean, error: string | null, data: any }>}
 */
export async function moveTreasureToContainerAction({
  vaultId,
  treasureName,
  treasureId,
  containerId,
  fromContainerName,
  toContainerName,
}) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false, error: "You must be logged in.", data: null };
    }

    if (!vaultId) return { ok: false, error: "Missing vault id.", data: null };
    if (!treasureId)
      return { ok: false, error: "Missing treasure id.", data: null };
    const updateResult = await updateTreasureForVaultById(vaultId, treasureId, {
      container_id: containerId,
    });

    if (!updateResult.ok) {
      return {
        ok: false,
        error: updateResult.error || "Move treasure failed.",
        data: null,
      };
    }

    const { before, after } = updateResult.data || {};
    const displayName = treasureName || after?.name || "Treasure";
    const fromLabel = fromContainerName || "Unassigned";
    const toLabel = toContainerName || "Unassigned";

    const logInput = await buildVaultLogInput({
      vaultId,
      source: "treasures",
      action: "update",
      entityType: "treasures",
      entityId: treasureId,
      before,
      after,
      labels: {
        name: "Name",
        description: "Description",
        value: "Value",
        container_id: "Container",
      },
      message: `${displayName} moved from ${fromLabel} to ${toLabel}`,
    });

    await safeCreateVaultLog({ tryCreateVaultLog, input: logInput });

    return { ok: true, error: null, data: updateResult.data?.after || null };
  } catch (error) {
    return {
      ok: false,
      error: error?.message || "Move treasure failed.",
      data: null,
    };
  }
}

/**
 * - Transfer a treasure to another vault and container.
 * @param {{ fromVaultId: string, toVaultId: string, treasureId: string, containerId: string, treasureName?: string }} input
 * @returns {Promise<{ ok: boolean, error: string | null, data: any }>}
 */
export async function transferTreasureToVaultAction({
  fromVaultId,
  toVaultId,
  treasureId,
  containerId,
  treasureName,
}) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false, error: "You must be logged in.", data: null };
    }

    const userId = session.user.userId;
    if (!fromVaultId || !toVaultId || !treasureId || !containerId) {
      return {
        ok: false,
        error: "Missing transfer details.",
        data: null,
      };
    }

    if (String(fromVaultId) === String(toVaultId)) {
      return {
        ok: false,
        error: "Choose a different vault for transfers.",
        data: null,
      };
    }

    const [fromVault, toVault, fromPermRes, toPermRes, toContainers] =
      await Promise.all([
        getVaultById(fromVaultId),
        getVaultById(toVaultId),
        getPermissionByVaultAndUserId(fromVaultId, userId),
        getPermissionByVaultAndUserId(toVaultId, userId),
        getContainersForVault(toVaultId),
      ]);

    if (!fromVault || !toVault) {
      return { ok: false, error: "Vault could not be loaded.", data: null };
    }

    const fromPerm = Array.isArray(fromPermRes?.data)
      ? fromPermRes.data[0]
      : null;
    const toPerm = Array.isArray(toPermRes?.data) ? toPermRes.data[0] : null;

    const canTransferOut =
      Boolean(fromVault?.allow_xfer_out) &&
      (String(fromVault?.user_id) === String(userId) ||
        Boolean(fromPerm?.transfer_treasures_out));
    const canTransferIn =
      Boolean(toVault?.allow_xfer_in) &&
      (String(toVault?.user_id) === String(userId) ||
        Boolean(toPerm?.transfer_treasures_in));

    if (!canTransferOut || !canTransferIn) {
      return {
        ok: false,
        error: "You do not have permission to transfer treasures.",
        data: null,
      };
    }

    const targetContainer = (toContainers || []).find(
      (c) => String(c.id) === String(containerId),
    );
    if (!targetContainer) {
      return {
        ok: false,
        error: "Target container not found.",
        data: null,
      };
    }

    const transferResult = await transferTreasureToVault({
      fromVaultId,
      toVaultId,
      treasureId,
      containerId,
    });

    if (!transferResult?.ok) {
      return {
        ok: false,
        error: transferResult?.error || "Transfer failed.",
        data: null,
      };
    }

    const { before, after } = transferResult.data || {};
    const displayName = treasureName || before?.name || after?.name || "Treasure";
    const fromContainer =
      fromVault?.containerList?.find(
        (c) => String(c.id) === String(before?.container_id),
      )?.name || "Unassigned";
    const toContainer = targetContainer?.name || "Unassigned";

    const fromMessage = `${displayName} transferred to ${toVault?.name || "vault"} (${toContainer})`;
    const toMessage = `${displayName} received from ${fromVault?.name || "vault"} (${fromContainer})`;

    const fromLog = await buildVaultLogInput({
      vaultId: fromVaultId,
      source: "treasures",
      action: "transfer_out",
      entityType: "treasures",
      entityId: treasureId,
      before,
      after,
      labels: {
        name: "Name",
        container_id: "Container",
      },
      message: fromMessage,
    });

    const toLog = await buildVaultLogInput({
      vaultId: toVaultId,
      source: "treasures",
      action: "transfer_in",
      entityType: "treasures",
      entityId: treasureId,
      before,
      after,
      labels: {
        name: "Name",
        container_id: "Container",
      },
      message: toMessage,
    });

    const [fromResult, toResult] = await Promise.all([
      tryCreateVaultLog(fromLog),
      tryCreateVaultLog(toLog),
    ]);

    if (!fromResult?.ok || !toResult?.ok) {
      console.error("Transfer treasure log failed", {
        fromVaultId,
        toVaultId,
        fromError: fromResult?.error,
        toError: toResult?.error,
      });
    }

    revalidatePath(`/public/vaults/${fromVaultId}`);
    revalidatePath(`/public/vaults/${toVaultId}`);
    revalidatePath(`/account/vaults/${fromVaultId}`);
    revalidatePath(`/account/vaults/${toVaultId}`);

    return { ok: true, error: null, data: after || null };
  } catch (error) {
    return {
      ok: false,
      error: error?.message || "Transfer treasure failed.",
      data: null,
    };
  }
}
