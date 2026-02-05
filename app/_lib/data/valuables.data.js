/**
 * Data: Valuables
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { createHoldingsEntry } from "@/app/_lib/data/holdings.data";

/**
 * Fetch valuables for a vault.
 * @param {string} vaultId
 * @returns {Promise<Array<object>>}
 */
export async function getValuablesForVault(vaultId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("valuables")
    .select("*")
    .eq("vault_id", vaultId)
    .or("archived.is.null,archived.eq.false")
    .order("name", { ascending: true });

  if (error) {
    console.error("getValuablesForVault failed", error);
    return [];
  }
  return data ?? [];
}

/**
 * Fetch valuables for a container in a vault.
 * @param {string} vaultId
 * @param {string} containerId
 * @returns {Promise<Array<object>>}
 */
export async function getValuablesForContainer(vaultId, containerId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("valuables")
    .select("*")
    .eq("vault_id", vaultId)
    .eq("container_id", containerId)
    .or("archived.is.null,archived.eq.false")
    .order("name", { ascending: true });

  if (error) {
    console.error("getValuablesForContainer failed", error);
    return [];
  }
  return data ?? [];
}

/**
 * Create a valuable.
 * @param {object} valuableObj
 * @returns {Promise<Array<object>>}
 */
export async function createValuableDb(valuableObj) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("valuables")
    .insert([valuableObj])
    .select();

  if (error) {
    console.error("createValuableDb failed", error);
    return [];
  }
  return data ?? [];
}

/**
 * Create multiple valuables.
 * @param {Array<object>} valuableList
 * @returns {Promise<Array<object>>}
 */
export async function createValuablesDb(valuableList) {
  const supabase = await getSupabase();
  const rows = Array.isArray(valuableList) ? valuableList : [];

  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from("valuables")
    .insert(rows)
    .select();

  if (error) {
    console.error("createValuablesDb failed", error);
    return [];
  }
  return data ?? [];
}

/**
 * Fetch default valuables for a vault.
 * @param {string} vaultId
 * @returns {Promise<Array<object>>}
 */
export async function getDefaultValuables(vaultId) {
  const vault = await getVaultById(vaultId);
  if (!vault?.system_id) return [];

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("defaultvaluables")
    .select("*")
    .eq("system_id", vault.system_id);

  if (error) {
    console.error("getDefaultValuables failed", error);
    return [];
  }
  return data ?? [];
}

/**
 * Fetch a valuable by id in a vault.
 * @param {string} vaultId
 * @param {string} valuableId
 * @returns {Promise<Array<object>>}
 */
export async function getValuableForVaultById(vaultId, valuableId) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("valuables")
    .select("*")
    .eq("vault_id", vaultId)
    .eq("id", valuableId)
    .or("archived.is.null,archived.eq.false")
    .maybeSingle();

  if (error?.code === "PGRST116") return null;
  if (error) {
    console.error("getValuableForVaultById failed", error);
    return null;
  }
  return data ?? null;
}

/**
 * Delete a valuable by id in a vault.
 * @param {string} vaultId
 * @param {string} valuableId
 */
export async function deleteValuableForVaultById(vaultId, valuableId) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("valuables")
    .delete()
    .eq("vault_id", vaultId)
    .eq("id", valuableId);
  if (error) {
    console.error("deleteValuableForVaultById failed", error);
    return false;
  }
  return true;
}

/**
 * Update a valuable by id in a vault.
 * @param {string} vaultId
 * @param {string} valuableId
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateValuableForVaultById(vaultId, valuableId, updates) {
  const supabase = await getSupabase();

  const safeUpdates = { ...updates };
  delete safeUpdates.id;
  delete safeUpdates.vault_id;

  const { data: before, error: beforeError } = await supabase
    .from("valuables")
    .select("*")
    .eq("id", valuableId)
    .eq("vault_id", vaultId)
    .single();

  if (beforeError) {
    console.error(
      "updateValuableForVaultById before fetch failed",
      beforeError,
    );
    return { ok: false, error: "Valuable could not be loaded.", data: null };
  }

  const { data: after, error: updateError } = await supabase
    .from("valuables")
    .update(safeUpdates)
    .eq("id", valuableId)
    .eq("vault_id", vaultId)
    .select("*")
    .single();

  if (updateError) {
    console.error("updateValuableForVaultById update failed", updateError);
    return { ok: false, error: "Valuable could not be updated.", data: null };
  }

  return { ok: true, error: null, data: { before, after } };
}

/**
 * Transfer a valuable to another vault and container.
 * @param {{ fromVaultId: string, toVaultId: string, valuableId: string, containerId: string }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: { before: any, after: any } | null }>}
 */
export async function transferValuableToVault({
  fromVaultId,
  toVaultId,
  valuableId,
  containerId,
}) {
  const supabase = await getSupabase();

  const { data: beforeRows, error: beforeError } = await supabase
    .from("valuables")
    .select("*")
    .eq("id", valuableId)
    .eq("vault_id", fromVaultId);

  if (beforeError) {
    console.error("transferValuableToVault: before fetch failed", beforeError);
    return { ok: false, error: "Valuable could not be loaded.", data: null };
  }

  if (!Array.isArray(beforeRows) || beforeRows.length !== 1) {
    return { ok: false, error: "Valuable not found.", data: null };
  }

  const before = beforeRows[0];

  const { data: afterRows, error: updateError } = await supabase
    .from("valuables")
    .update({
      vault_id: toVaultId,
      container_id: containerId,
    })
    .eq("id", valuableId)
    .eq("vault_id", fromVaultId)
    .select("*");

  if (updateError) {
    console.error("transferValuableToVault: update failed", updateError);
    return {
      ok: false,
      error: "Valuable could not be transferred.",
      data: null,
    };
  }

  if (!Array.isArray(afterRows) || afterRows.length !== 1) {
    return {
      ok: false,
      error: "Valuable could not be transferred.",
      data: null,
    };
  }

  const after = afterRows[0];

  return { ok: true, error: null, data: { before, after } };
}

/**
 * - Sell a valuable by archiving it and crediting common currency holdings.
 * @param {{ vaultId: string, valuableId: string }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: { before: any, after: any, holdings: any, saleBaseValue: number, saleCommonValue: number, commonCurrency: any } | null }>}
 */
export async function sellValuableForVaultById({ vaultId, valuableId }) {
  if (!vaultId) return { ok: false, error: "Missing vault id.", data: null };
  if (!valuableId)
    return { ok: false, error: "Missing valuable id.", data: null };

  const supabase = await getSupabase();
  const { data: before, error: valuableError } = await supabase
    .from("valuables")
    .select("*")
    .eq("vault_id", vaultId)
    .eq("id", valuableId)
    .single();

  if (valuableError) {
    console.error("sellValuableForVaultById fetch failed", valuableError);
    return { ok: false, error: "Could not load valuable.", data: null };
  }

  if (before?.archived) {
    return { ok: false, error: "Valuable is already archived.", data: null };
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

  function toPercent(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    if (num > 1) return num;
    if (num < 0) return 0;
    return num * 100;
  }

  const baseValue = Number(before?.value) || 0;
  const qtyRaw = Number(before?.quantity);
  const quantity = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : 1;
  const percentOff = toPercent(vault?.vo_sell_markup);
  const saleMultiplier = Math.max(0, 1 - percentOff / 100);
  const saleBaseValue = baseValue * quantity * saleMultiplier;
  const saleCommonValue = saleBaseValue / commonRate;

  const { data: after, error: updateError } = await supabase
    .from("valuables")
    .update({ archived: true })
    .eq("vault_id", vaultId)
    .eq("id", valuableId)
    .select("*")
    .single();

  if (updateError) {
    console.error("sellValuableForVaultById update failed", updateError);
    return { ok: false, error: "Could not archive valuable.", data: null };
  }

  const holdings = await createHoldingsEntry({
    vaultId,
    currencyId: String(commonCurrency.id),
    value: saleCommonValue,
  });

  if (!holdings) {
    console.error("sellValuableForVaultById holdings insert failed", {
      vaultId,
      valuableId,
      commonCurrencyId: commonCurrency.id,
    });
    const { error: rollbackError } = await supabase
      .from("valuables")
      .update({ archived: false })
      .eq("vault_id", vaultId)
      .eq("id", valuableId);
    if (rollbackError) {
      console.error("sellValuableForVaultById rollback failed", rollbackError);
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
