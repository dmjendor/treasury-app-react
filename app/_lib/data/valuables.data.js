/**
 * Data: Valuables
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";
import { getVaultById } from "@/app/_lib/data/vaults.data";

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
 * Create multiple prep valuables.
 * @param {Array<object>} valuableList
 * @returns {Promise<Array<object>>}
 */
export async function createPrepValuablesDb(valuableList) {
  const supabase = await getSupabase();
  const rows = Array.isArray(valuableList) ? valuableList : [];

  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from("prepvaluables")
    .insert(rows)
    .select();

  if (error) {
    console.error("createPrepValuablesDb failed", error);
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
