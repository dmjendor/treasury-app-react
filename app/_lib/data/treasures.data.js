/**
 * Data: Treasures
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { createHoldingsEntry } from "@/app/_lib/data/holdings.data";
import { tryCreateVaultLog } from "@/app/_lib/data/logs.data";

/**
 * Fetch treasures for a vault.
 * @param {string} vaultId
 * @returns {Promise<Array<object>>}
 */
export async function getTreasuresForVault(vaultId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("treasures")
    .select("*")
    .eq("vault_id", vaultId)
    .or("archived.is.null,archived.eq.false")
    .order("name", { ascending: true });

  if (error) {
    console.error("getTreasuresForContainer failed", error);
    return [];
  }
  return data ?? [];
}

/**
 * Fetch treasures for a container in a vault.
 * @param {string} vaultId
 * @param {string} containerId
 * @returns {Promise<Array<object>>}
 */
export async function getTreasuresForContainer(vaultId, containerId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("treasures")
    .select("*")
    .eq("vault_id", vaultId)
    .eq("container_id", containerId)
    .or("archived.is.null,archived.eq.false")
    .order("name", { ascending: true });

  if (error) {
    console.error("createTreasureDb failed", error);
    return [];
  }
  return data ?? [];
}

/**
 * Create a treasure.
 * @param {object} treasureObj
 * @returns {Promise<Array<object>>}
 */
export async function createTreasureDb(treasureObj, options = {}) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("treasures")
    .insert([treasureObj])
    .select();

  if (error) {
    console.error("getTreasuresForVault failed", error);
    return [];
  }

  return data ?? [];
}

/**
 * Fetch default treasures for a vault.
 * @param {string} vaultId
 * @returns {Promise<Array<object>>}
 */
export async function getDefaultTreasures(vaultId) {
  const vault = await getVaultById(vaultId);
  if (!vault?.system_id) return [];

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("defaulttreasures")
    .select("*")
    .eq("system_id", vault.system_id);

  if (error) {
    console.error("getDefaultTreasures failed", error);
    return [];
  }
  return data ?? [];
}

/**
 * Fetch a treasure by id in a vault.
 * @param {string} vaultId
 * @param {string} treasureId
 * @returns {Promise<Array<object>>}
 */
export async function getTreasureForVaultById(vaultId, treasureId) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("treasures")
    .select("*")
    .eq("vault_id", vaultId)
    .eq("id", treasureId)
    .or("archived.is.null,archived.eq.false")
    .maybeSingle();

  if (error?.code === "PGRST116") return null;
  if (error) {
    console.error("getTreasureForVaultById failed", error);
    return null;
  }
  return data ?? null;
}

/**
 * Delete a treasure by id in a vault.
 * @param {string} vaultId
 * @param {string} treasureId
 */
export async function deleteTreasureForVaultById(vaultId, treasureId) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("treasures")
    .update({ archived: true })
    .eq("vault_id", vaultId)
    .eq("id", treasureId);
  if (error) {
    console.error("deleteTreasureForVaultById failed", error);
    return false;
  }

  await tryCreateVaultLog({
    vaultId,
    source: "treasures",
    action: "archive",
    entityType: "treasures",
    entityId: treasureId,
  });
  return true;
}

/**
 * Update a treasure by id in a vault.
 * @param {string} vaultId
 * @param {string} treasureId
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateTreasureForVaultById(vaultId, treasureId, updates) {
  const supabase = await getSupabase();

  const safeUpdates = { ...updates };
  delete safeUpdates.id;
  delete safeUpdates.vault_id;

  const { data: before, error: beforeError } = await supabase
    .from("treasures")
    .select("*")
    .eq("id", treasureId)
    .eq("vault_id", vaultId)
    .single();

  if (beforeError) {
    console.error(
      "updateTreasureForVaultById before fetch failed",
      beforeError,
    );
    return { ok: false, error: "Treasure could not be loaded.", data: null };
  }

  const { data: after, error: updateError } = await supabase
    .from("treasures")
    .update(safeUpdates)
    .eq("id", treasureId)
    .eq("vault_id", vaultId)
    .select("*")
    .single();

  if (updateError) {
    console.error("updateTreasureForVaultById update failed", updateError);
    return { ok: false, error: "Treasure could not be updated.", data: null };
  }

  return { ok: true, error: null, data: { before, after } };
}

/**
 * Transfer a treasure to another vault and container.
 * @param {{ fromVaultId: string, toVaultId: string, treasureId: string, containerId: string }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: { before: any, after: any } | null }>}
 */
export async function transferTreasureToVault({
  fromVaultId,
  toVaultId,
  treasureId,
  containerId,
}) {
  const supabase = await getSupabase();

  const { data: beforeRows, error: beforeError } = await supabase
    .from("treasures")
    .select("*")
    .eq("id", treasureId)
    .eq("vault_id", fromVaultId);

  if (beforeError) {
    console.error("transferTreasureToVault: before fetch failed", beforeError);
    return { ok: false, error: "Treasure could not be loaded.", data: null };
  }

  if (!Array.isArray(beforeRows) || beforeRows.length !== 1) {
    return { ok: false, error: "Treasure not found.", data: null };
  }

  const before = beforeRows[0];

  const { data: afterRows, error: updateError } = await supabase
    .from("treasures")
    .update({
      vault_id: toVaultId,
      container_id: containerId,
    })
    .eq("id", treasureId)
    .eq("vault_id", fromVaultId)
    .select("*");

  if (updateError) {
    console.error("transferTreasureToVault: update failed", updateError);
    return {
      ok: false,
      error: "Treasure could not be transferred.",
      data: null,
    };
  }

  if (!Array.isArray(afterRows) || afterRows.length !== 1) {
    return {
      ok: false,
      error: "Treasure could not be transferred.",
      data: null,
    };
  }

  const after = afterRows[0];

  return { ok: true, error: null, data: { before, after } };
}

/**
 * - Sell a treasure by archiving it and crediting common currency holdings.
 * @param {{ vaultId: string, treasureId: string }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: { before: any, after: any, holdings: any, saleBaseValue: number, saleCommonValue: number, commonCurrency: any } | null }>}
 */
export async function sellTreasureForVaultById({ vaultId, treasureId }) {
  if (!vaultId) return { ok: false, error: "Missing vault id.", data: null };
  if (!treasureId)
    return { ok: false, error: "Missing treasure id.", data: null };

  const supabase = await getSupabase();
  const { data: before, error: treasureError } = await supabase
    .from("treasures")
    .select("*")
    .eq("vault_id", vaultId)
    .eq("id", treasureId)
    .single();

  if (treasureError) {
    console.error("sellTreasureForVaultById fetch failed", treasureError);
    return { ok: false, error: "Could not load treasure.", data: null };
  }

  if (before?.archived) {
    return { ok: false, error: "Treasure is already archived.", data: null };
  }

  const vault = await getVaultById(vaultId);
  if (!vault) {
    return { ok: false, error: "Vault could not be loaded.", data: null };
  }

  const currencies = Array.isArray(vault?.currencyList)
    ? vault.currencyList
    : [];
  const commonCurrency = currencies.find(
    (currency) => String(currency.id) === String(vault?.common_currency_id),
  );

  if (!commonCurrency) {
    return { ok: false, error: "Common currency not found.", data: null };
  }

  const commonRate = Number(commonCurrency?.rate) || 0;
  if (commonRate <= 0) {
    return { ok: false, error: "Common currency has no rate.", data: null };
  }

  const baseValue = Number(before?.value) || 0;
  const qtyRaw = Number(before?.quantity);
  const quantity = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : 1;
  const saleBaseValue = baseValue * quantity;
  const saleCommonValue = saleBaseValue / commonRate;

  const { data: after, error: updateError } = await supabase
    .from("treasures")
    .update({ archived: true })
    .eq("vault_id", vaultId)
    .eq("id", treasureId)
    .select("*")
    .single();

  if (updateError) {
    console.error("sellTreasureForVaultById update failed", updateError);
    return { ok: false, error: "Could not archive treasure.", data: null };
  }

  const holdings = await createHoldingsEntry({
    vaultId,
    currencyId: String(commonCurrency.id),
    value: saleCommonValue,
  });

  if (!holdings) {
    console.error("sellTreasureForVaultById holdings insert failed", {
      vaultId,
      treasureId,
      commonCurrencyId: commonCurrency.id,
    });
    const { error: rollbackError } = await supabase
      .from("treasures")
      .update({ archived: false })
      .eq("vault_id", vaultId)
      .eq("id", treasureId);
    if (rollbackError) {
      console.error("sellTreasureForVaultById rollback failed", rollbackError);
    }
    return { ok: false, error: "Could not record holdings.", data: null };
  }

  return {
    ok: true,
    error: null,
    data: {
      before,
      after,
      holdings,
      saleBaseValue,
      saleCommonValue,
      commonCurrency,
    },
  };
}
