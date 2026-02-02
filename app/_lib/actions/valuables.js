"use server";

import crypto from "crypto";
import {
  createValuableDb,
  createValuablesDb,
  getDefaultValuables,
  getValuableForVaultById,
  transferValuableToVault,
  updateValuableForVaultById,
} from "@/app/_lib/data/valuables.data";
import { auth } from "@/app/_lib/auth";
import { tryCreateVaultLog } from "@/app/_lib/data/logs.data";
import { buildVaultLogInput } from "@/app/_lib/logging/createVaultLog";
import { getContainersForVault } from "@/app/_lib/data/containers.data";
import { getPermissionByVaultAndUserId } from "@/app/_lib/data/permissions.data";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { revalidatePath } from "next/cache";
import {
  generateValuableName,
  getValuableCategoryKeys,
} from "@/app/_lib/generators/valuableNames";
import { toCamelCase } from "@/app/_lib/actions/_utils";

function randomIntInclusive(min, max) {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  if (lo === hi) return lo;
  return crypto.randomInt(lo, hi + 1);
}

export async function createValuableAction(payload) {
  const created = await createValuableDb(payload);
  if (!Array.isArray(created) || created.length === 0) {
    return { ok: false, error: "Create valuable failed." };
  }
  return { ok: true };
}

export async function getDefaultValuablesAction({ vaultId }) {
  if (!vaultId) return { ok: false, error: "Missing vaultId", data: null };

  const rows = await getDefaultValuables(vaultId);
  return { ok: true, error: null, data: Array.isArray(rows) ? rows : [] };
}

/**
 * - Get generator category keys.
 * @returns {Promise<{ ok: boolean, error: string|null, data: string[] }>}
 */
export async function getValuableGeneratorCategoriesAction() {
  try {
    const keys = getValuableCategoryKeys();
    return { ok: true, error: null, data: Array.isArray(keys) ? keys : [] };
  } catch (error) {
    console.error("getValuableGeneratorCategoriesAction failed", error);
    return {
      ok: false,
      error: "Unable to load valuable categories.",
      data: [],
    };
  }
}

/**
 * - Generate valuables from a category and value range.
 * @param {{ vault_id: string, container_id: string, category_key: string, low_value: number, high_value: number, quantity: number, target?: "valuables" | "prepvaluables" }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: Array<any> }>}
 */
export async function generateValuablesAction(input) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false, error: "You must be logged in.", data: [] };
    }

    const vaultId = input?.vault_id;
    const containerId = input?.container_id;
    const categoryKey = input?.category_key;
    const lowRaw = Number(input?.low_value);
    const highRaw = Number(input?.high_value);
    const qtyRaw = Number(input?.quantity);
    const target =
      input?.target === "prepvaluables" ? "prepvaluables" : "valuables";
    if (!vaultId) return { ok: false, error: "Missing vault id.", data: [] };
    if (!containerId)
      return { ok: false, error: "Missing container id.", data: [] };
    if (!categoryKey)
      return { ok: false, error: "Missing category.", data: [] };
    if (!Number.isFinite(lowRaw) || !Number.isFinite(highRaw)) {
      return { ok: false, error: "Value range is required.", data: [] };
    }
    const low = Math.max(0, Math.trunc(lowRaw));
    const high = Math.max(0, Math.trunc(highRaw));
    const quantity = Number.isFinite(qtyRaw)
      ? Math.max(1, Math.trunc(qtyRaw))
      : 1;

    const rows = [];
    for (let i = 0; i < quantity; i += 1) {
      const category = await toCamelCase(categoryKey);
      const finalValue = randomIntInclusive(low, high);
      const generated = generateValuableName({ category, value: finalValue });
      const safeName =
        typeof generated?.name === "string" && generated.name.trim()
          ? generated.name.trim()
          : "Curious trinket";
      const safeDescription =
        typeof generated?.description === "string" &&
        generated.description.trim()
          ? generated.description.trim()
          : null;

      rows.push({
        vault_id: vaultId,
        container_id: containerId,
        name: safeName,
        description: safeDescription,
        value: finalValue,
        quantity: 1,
      });
    }

    if (target === "prepvaluables") {
      return { ok: true, error: null, data: rows };
    }

    const created = await createValuablesDb(rows);

    if (!Array.isArray(created) || created.length === 0) {
      return { ok: false, error: "Failed to generate valuables.", data: [] };
    }

    return { ok: true, error: null, data: created };
  } catch (error) {
    console.error("generateValuablesAction failed", error);
    return {
      ok: false,
      error: error?.message || "Failed to generate valuables.",
      data: [],
    };
  }
}

/**
 * - Get a valuable for a vault by id.
 * @param {{ vaultId: string, valuableId: string }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: any }>}
 */
export async function getValuableForVaultByIdAction({ vaultId, valuableId }) {
  if (!vaultId || !valuableId) {
    return { ok: false, error: "Missing valuable id.", data: null };
  }

  const data = await getValuableForVaultById(vaultId, valuableId);
  if (!data) {
    return { ok: false, error: "Valuable not found.", data: null };
  }
  return { ok: true, error: null, data };
}

/**
 * - Move a valuable to a new container.
 * @param {{ vaultId: string, valuableId: string, containerId: string, valuableName?: string, fromContainerName?: string, toContainerName?: string }} input
 * @returns {Promise<{ ok: boolean, error: string | null, data: any }>}
 */
export async function moveValuableToContainerAction({
  vaultId,
  valuableId,
  containerId,
  valuableName,
  fromContainerName,
  toContainerName,
}) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false, error: "You must be logged in.", data: null };
    }

    if (!vaultId) return { ok: false, error: "Missing vault id.", data: null };
    if (!valuableId)
      return { ok: false, error: "Missing valuable id.", data: null };

    const updateResult = await updateValuableForVaultById(vaultId, valuableId, {
      container_id: containerId,
    });

    if (!updateResult?.ok) {
      return {
        ok: false,
        error: updateResult?.error || "Move valuable failed.",
        data: null,
      };
    }

    const { before, after } = updateResult.data || {};
    const displayName = valuableName || after?.name || "Valuable";
    const fromLabel = fromContainerName || "Unassigned";
    const toLabel = toContainerName || "Unassigned";

    const logInput = await buildVaultLogInput({
      vaultId,
      source: "valuables",
      action: "update",
      entityType: "valuables",
      entityId: valuableId,
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
      error: error?.message || "Move valuable failed.",
      data: null,
    };
  }
}

/**
 * - Transfer a valuable to another vault and container.
 * @param {{ fromVaultId: string, toVaultId: string, valuableId: string, containerId: string, valuableName?: string }} input
 * @returns {Promise<{ ok: boolean, error: string | null, data: any }>}
 */
export async function transferValuableToVaultAction({
  fromVaultId,
  toVaultId,
  valuableId,
  containerId,
  valuableName,
}) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false, error: "You must be logged in.", data: null };
    }

    const userId = session.user.userId;
    if (!fromVaultId || !toVaultId || !valuableId || !containerId) {
      return { ok: false, error: "Missing transfer details.", data: null };
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
        Boolean(fromPerm?.transfer_valuables_out));
    const canTransferIn =
      Boolean(toVault?.allow_xfer_in) &&
      (String(toVault?.user_id) === String(userId) ||
        Boolean(toPerm?.transfer_valuables_in));

    if (!canTransferOut || !canTransferIn) {
      return {
        ok: false,
        error: "You do not have permission to transfer valuables.",
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

    const transferResult = await transferValuableToVault({
      fromVaultId,
      toVaultId,
      valuableId,
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
    const displayName =
      valuableName || before?.name || after?.name || "Valuable";
    const fromContainer =
      fromVault?.containerList?.find(
        (c) => String(c.id) === String(before?.container_id),
      )?.name || "Unassigned";
    const toContainer = targetContainer?.name || "Unassigned";

    const fromMessage = `${displayName} transferred to ${toVault?.name || "vault"} (${toContainer})`;
    const toMessage = `${displayName} received from ${fromVault?.name || "vault"} (${fromContainer})`;

    const fromLog = await buildVaultLogInput({
      vaultId: fromVaultId,
      source: "valuables",
      action: "transfer_out",
      entityType: "valuables",
      entityId: valuableId,
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
      source: "valuables",
      action: "transfer_in",
      entityType: "valuables",
      entityId: valuableId,
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
      console.error("Transfer valuable log failed", {
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
      error: error?.message || "Transfer valuable failed.",
      data: null,
    };
  }
}
