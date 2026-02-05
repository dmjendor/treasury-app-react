/**
 * Data: Reward prep
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";
import { auth } from "@/app/_lib/auth";

/**
 * Create a reward prep.
 * @param {{ vault_id: string, name: string, description?: string }} input
 * @returns {Promise<Array<object>>}
 */
export async function createRewardPrepDb(input) {
  const session = await auth();
  if (!session) {
    return { ok: false, error: "You must be logged in.", data: null };
  }

  const supabase = await getSupabase();
  const payload = {
    vault_id: input?.vault_id,
    user_id: session?.user?.userId,
    name: input?.name,
    description: input?.description ?? "",
  };

  const { data, error } = await supabase
    .from("rewardprep")
    .insert([payload])
    .select();

  if (error) {
    console.error("createRewardPrepDb failed", error);
    return [];
  }

  return data ?? [];
}

/**
 * Create multiple prep holdings.
 * @param {Array<object>} holdingList
 * @returns {Promise<Array<object>>}
 */
export async function createPrepHoldingsDb(holdingList) {
  const session = await auth();
  if (!session) {
    return { ok: false, error: "You must be logged in.", data: null };
  }

  const supabase = await getSupabase();
  const rows = Array.isArray(holdingList) ? holdingList : [];
  if (rows.length === 0) return [];

  const finalRows = rows.map((row) => ({
    ...row,
    change_by: session?.user?.userId,
  }));

  const { data, error } = await supabase
    .from("prepholdings")
    .insert(finalRows)
    .select();

  if (error) {
    console.error("createPrepHoldingsDb failed", error);
    return [];
  }

  return data ?? [];
}

/**
 * Create multiple prep treasures.
 * @param {Array<object>} treasureList
 * @returns {Promise<Array<object>>}
 */
export async function createPrepTreasuresDb(treasureList) {
  const session = await auth();
  if (!session) {
    return { ok: false, error: "You must be logged in.", data: null };
  }
  const supabase = await getSupabase();
  const rows = Array.isArray(treasureList) ? treasureList : [];

  if (rows.length === 0) return [];
  const finalRows = rows.map((row) => ({
    ...row,
    change_by: session?.user?.userId,
  }));

  const { data, error } = await supabase
    .from("preptreasures")
    .insert(finalRows)
    .select();

  if (error) {
    console.error("createPrepTreasuresDb failed", error);
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
  const session = await auth();
  if (!session) {
    return { ok: false, error: "You must be logged in.", data: null };
  }
  const supabase = await getSupabase();
  const rows = Array.isArray(valuableList) ? valuableList : [];

  if (rows.length === 0) return [];
  const finalRows = rows.map((row) => ({
    ...row,
    change_by: session?.user?.userId,
  }));

  const { data, error } = await supabase
    .from("prepvaluables")
    .insert(finalRows)
    .select();

  if (error) {
    console.error("createPrepValuablesDb failed", error);
    return [];
  }
  return data ?? [];
}

/**
 * Fetch prepared rewards for a vault.
 * @param {string} vaultId
 * @returns {Promise<Array<object>>}
 */
export async function getRewardPrepListDb(vaultId, showAll) {
  const session = await auth();
  if (!session) {
    return { ok: false, error: "You must be logged in.", data: null };
  }

  const supabase = await getSupabase();
  const query = supabase
    .from("rewardprep")
    .select(
      "*, prepholdings(count), preptreasures(count), prepvaluables(count)",
    )
    .eq("vault_id", vaultId);

  if (!showAll) {
    query.eq("archived", false);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getRewardPrepListDb failed", error);
    return { ok: false, error: "Reward list could not be loaded.", data: null };
  }
  return { ok: true, error: null, data };
}

/**
 * Fetch a prepared reward and its items.
 * @param {{ vaultId: string, rewardPrepId: string }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: object|null }>}
 */
export async function getRewardPrepByIdDb(input) {
  const session = await auth();
  if (!session) {
    return { ok: false, error: "You must be logged in.", data: null };
  }

  const vaultId = input?.vaultId;
  const rewardPrepId = input?.rewardPrepId;
  if (!vaultId || !rewardPrepId) {
    return { ok: false, error: "Missing reward prep id.", data: null };
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("rewardprep")
    .select("*, prepholdings(*), preptreasures(*), prepvaluables(*)")
    .eq("vault_id", vaultId)
    .eq("id", rewardPrepId)
    .maybeSingle();

  if (error) {
    console.error("getRewardPrepByIdDb failed", error);
    return { ok: false, error: "Reward prep could not be loaded.", data: null };
  }

  return { ok: true, error: null, data: data ?? null };
}

/**
 * Update a prepared reward record.
 * @param {{ vault_id: string, reward_id: string, name: string, description?: string }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: object|null }>}
 */
export async function updateRewardPrepDb(input) {
  const session = await auth();
  if (!session) {
    return { ok: false, error: "You must be logged in.", data: null };
  }

  const supabase = await getSupabase();
  const payload = {
    name: input?.name,
    description: input?.description ?? "",
  };

  const { data, error } = await supabase
    .from("rewardprep")
    .update(payload)
    .eq("vault_id", input?.vault_id)
    .eq("id", input?.reward_id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("updateRewardPrepDb failed", error);
    return {
      ok: false,
      error: "Reward prep could not be updated.",
      data: null,
    };
  }

  return { ok: true, error: null, data: data ?? null };
}

/**
 * Delete all items for a prepared reward.
 * @param {{ vaultId: string, rewardPrepId: string }} input
 * @returns {Promise<{ ok: boolean, error: string|null }>}
 */
export async function deleteRewardPrepItemsDb(input) {
  const session = await auth();
  if (!session) {
    return { ok: false, error: "You must be logged in.", data: null };
  }

  const vaultId = input?.vaultId;
  const rewardPrepId = input?.rewardPrepId;
  if (!vaultId || !rewardPrepId) {
    return { ok: false, error: "Missing reward prep id.", data: null };
  }

  const supabase = await getSupabase();
  const [holdingsRes, treasuresRes, valuablesRes] = await Promise.all([
    supabase
      .from("prepholdings")
      .delete()
      .eq("vault_id", vaultId)
      .eq("reward_id", rewardPrepId),
    supabase
      .from("preptreasures")
      .delete()
      .eq("vault_id", vaultId)
      .eq("reward_id", rewardPrepId),
    supabase
      .from("prepvaluables")
      .delete()
      .eq("vault_id", vaultId)
      .eq("reward_id", rewardPrepId),
  ]);

  const error = holdingsRes.error || treasuresRes.error || valuablesRes.error;
  if (error) {
    console.error("deleteRewardPrepItemsDb failed", error);
    return { ok: false, error: "Reward items could not be deleted." };
  }

  return { ok: true, error: null };
}

/**
 * Delete a prepared reward and its items.
 * @param {{ vaultId: string, rewardPrepId: string }} input
 * @returns {Promise<{ ok: boolean, error: string|null }>}
 */
export async function deleteRewardPrepDb(input) {
  const session = await auth();
  if (!session) {
    return { ok: false, error: "You must be logged in.", data: null };
  }

  const vaultId = input?.vaultId;
  const rewardPrepId = input?.rewardPrepId;
  if (!vaultId || !rewardPrepId) {
    return { ok: false, error: "Missing reward prep id.", data: null };
  }

  const itemRes = await deleteRewardPrepItemsDb({ vaultId, rewardPrepId });
  if (!itemRes.ok) {
    return itemRes;
  }

  const supabase = await getSupabase();
  const { error } = await supabase
    .from("rewardprep")
    .delete()
    .eq("vault_id", vaultId)
    .eq("id", rewardPrepId);

  if (error) {
    console.error("deleteRewardPrepDb failed", error);
    return { ok: false, error: "Reward prep could not be deleted." };
  }

  return { ok: true, error: null };
}

async function restorePrepRows({ supabase, table, vaultId, ids }) {
  if (!Array.isArray(ids) || ids.length === 0) return;
  await supabase
    .from(table)
    .update({ archived: false })
    .eq("vault_id", vaultId)
    .in("id", ids);
}

async function deleteCreatedRows({ supabase, table, vaultId, ids }) {
  if (!Array.isArray(ids) || ids.length === 0) return;
  await supabase.from(table).delete().eq("vault_id", vaultId).in("id", ids);
}

/**
 * Give prepared holdings by creating holdings and archiving prep rows.
 * @param {{ rewardPrepId: string, vaultId: string }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: { prepIds: string[], createdIds: string[] } }>}
 */
export async function givePrepHoldingsDb({ rewardPrepId, vaultId }) {
  const session = await auth();
  if (!session) {
    return { ok: false, error: "You must be logged in.", data: null };
  }

  const supabase = await getSupabase();
  const { data: prepRows, error } = await supabase
    .from("prepholdings")
    .select("id,currency_id,value")
    .eq("vault_id", vaultId)
    .eq("reward_id", rewardPrepId)
    .or("archived.is.null,archived.eq.false");
  if (error) {
    console.error("givePrepHoldingsDb failed", error);
    return { ok: false, error: "Reward holdings could not be given" };
  }

  if (!Array.isArray(prepRows) || prepRows.length === 0) {
    return { ok: true, error: null, data: { prepIds: [], createdIds: [] } };
  }

  const userId = session?.user?.userId || null;
  const now = new Date().toISOString();
  const holdingRows = prepRows.map((row) => ({
    vault_id: vaultId,
    currency_id: row.currency_id,
    value: row.value ?? 0,
    archived: false,
    change_by: userId,
    timestamp: now,
  }));

  const { data: created, error: insertError } = await supabase
    .from("holdings")
    .insert(holdingRows)
    .select("id");

  if (insertError) {
    console.error("givePrepHoldingsDb insert failed", insertError);
    return { ok: false, error: "Reward holdings could not be given." };
  }

  const prepIds = prepRows.map((row) => row.id);
  const createdIds = (created || []).map((row) => row.id);

  const { error: archiveError } = await supabase
    .from("prepholdings")
    .update({ archived: true })
    .eq("vault_id", vaultId)
    .in("id", prepIds);

  if (archiveError) {
    console.error("givePrepHoldingsDb archive failed", archiveError);
    return {
      ok: false,
      error: "Reward holdings could not be archived.",
      data: { prepIds, createdIds },
    };
  }

  return { ok: true, error: null, data: { prepIds, createdIds } };
}

/**
 * Give prepared treasures by creating treasures and archiving prep rows.
 * @param {{ rewardPrepId: string, vaultId: string }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: { prepIds: string[], createdIds: string[] } }>}
 */
export async function givePrepTreasuresDb({ rewardPrepId, vaultId }) {
  const session = await auth();
  if (!session) {
    return { ok: false, error: "You must be logged in.", data: null };
  }

  const supabase = await getSupabase();
  const { data: prepRows, error } = await supabase
    .from("preptreasures")
    .select(
      "id,container_id,name,genericname,description,value,quantity,identified,magical",
    )
    .eq("vault_id", vaultId)
    .eq("reward_id", rewardPrepId)
    .or("archived.is.null,archived.eq.false");
  if (error) {
    console.error("givePrepTreasuressDb failed", error);
    return { ok: false, error: "Reward treasures could not be given" };
  }

  if (!Array.isArray(prepRows) || prepRows.length === 0) {
    return { ok: true, error: null, data: { prepIds: [], createdIds: [] } };
  }

  const treasureRows = prepRows.map((row) => ({
    vault_id: vaultId,
    container_id: row.container_id,
    name: row.name,
    genericname: row.genericname ?? null,
    description: row.description ?? null,
    value: row.value ?? 0,
    quantity: row.quantity ?? 0,
    identified: Boolean(row.identified),
    magical: Boolean(row.magical),
    archived: false,
  }));

  const { data: created, error: insertError } = await supabase
    .from("treasures")
    .insert(treasureRows)
    .select("id");

  if (insertError) {
    console.error("givePrepTreasuresDb insert failed", insertError);
    return { ok: false, error: "Reward treasures could not be given." };
  }

  const prepIds = prepRows.map((row) => row.id);
  const createdIds = (created || []).map((row) => row.id);

  const { error: archiveError } = await supabase
    .from("preptreasures")
    .update({ archived: true })
    .eq("vault_id", vaultId)
    .in("id", prepIds);

  if (archiveError) {
    console.error("givePrepTreasuresDb archive failed", archiveError);
    return {
      ok: false,
      error: "Reward treasures could not be archived.",
      data: { prepIds, createdIds },
    };
  }

  return { ok: true, error: null, data: { prepIds, createdIds } };
}

/**
 * Give prepared valuables by creating valuables and archiving prep rows.
 * @param {{ rewardPrepId: string, vaultId: string }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: { prepIds: string[], createdIds: string[] } }>}
 */
export async function givePrepValuablesDb({ rewardPrepId, vaultId }) {
  const session = await auth();
  if (!session) {
    return { ok: false, error: "You must be logged in.", data: null };
  }

  const supabase = await getSupabase();
  const { data: prepRows, error } = await supabase
    .from("prepvaluables")
    .select("id,container_id,name,description,value,quantity")
    .eq("vault_id", vaultId)
    .eq("reward_id", rewardPrepId)
    .or("archived.is.null,archived.eq.false");
  if (error) {
    console.error("givePrepValuablesDb failed", error);
    return { ok: false, error: "Reward valuables could not be given" };
  }

  if (!Array.isArray(prepRows) || prepRows.length === 0) {
    return { ok: true, error: null, data: { prepIds: [], createdIds: [] } };
  }

  const valuableRows = prepRows.map((row) => ({
    vault_id: vaultId,
    container_id: row.container_id,
    name: row.name,
    description: row.description ?? null,
    value: row.value ?? 0,
    quantity: row.quantity ?? 0,
  }));

  const { data: created, error: insertError } = await supabase
    .from("valuables")
    .insert(valuableRows)
    .select("id");

  if (insertError) {
    console.error("givePrepValuablesDb insert failed", insertError);
    return { ok: false, error: "Reward valuables could not be given." };
  }

  const prepIds = prepRows.map((row) => row.id);
  const createdIds = (created || []).map((row) => row.id);

  const { error: archiveError } = await supabase
    .from("prepvaluables")
    .update({ archived: true })
    .eq("vault_id", vaultId)
    .in("id", prepIds);

  if (archiveError) {
    console.error("givePrepValuablesDb archive failed", archiveError);
    return {
      ok: false,
      error: "Reward valuables could not be archived.",
      data: { prepIds, createdIds },
    };
  }

  return { ok: true, error: null, data: { prepIds, createdIds } };
}

/**
 * Give a prepared reward by applying all items and archiving the reward.
 * @param {{ rewardPrepId: string, vaultId: string }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: object|null }>}
 */
export async function giveRewardPrepDb({ rewardPrepId, vaultId }) {
  const session = await auth();
  if (!session) {
    return { ok: false, error: "You must be logged in.", data: null };
  }
  if (!rewardPrepId || !vaultId) {
    return { ok: false, error: "Missing reward prep id.", data: null };
  }

  const supabase = await getSupabase();
  const rollbacks = {
    holdings: null,
    treasures: null,
    valuables: null,
  };

  const holdingsRes = await givePrepHoldingsDb({ rewardPrepId, vaultId });
  if (!holdingsRes?.ok) {
    await restorePrepRows({
      supabase,
      table: "prepholdings",
      vaultId,
      ids: holdingsRes?.data?.prepIds || [],
    });
    await deleteCreatedRows({
      supabase,
      table: "holdings",
      vaultId,
      ids: holdingsRes?.data?.createdIds || [],
    });
    return holdingsRes;
  }
  rollbacks.holdings = holdingsRes.data;

  const treasuresRes = await givePrepTreasuresDb({ rewardPrepId, vaultId });
  if (!treasuresRes?.ok) {
    await restorePrepRows({
      supabase,
      table: "preptreasures",
      vaultId,
      ids: treasuresRes?.data?.prepIds || [],
    });
    await deleteCreatedRows({
      supabase,
      table: "treasures",
      vaultId,
      ids: treasuresRes?.data?.createdIds || [],
    });
    await restorePrepRows({
      supabase,
      table: "prepholdings",
      vaultId,
      ids: rollbacks.holdings?.prepIds || [],
    });
    await deleteCreatedRows({
      supabase,
      table: "holdings",
      vaultId,
      ids: rollbacks.holdings?.createdIds || [],
    });
    return treasuresRes;
  }
  rollbacks.treasures = treasuresRes.data;

  const valuablesRes = await givePrepValuablesDb({ rewardPrepId, vaultId });
  if (!valuablesRes?.ok) {
    await restorePrepRows({
      supabase,
      table: "prepvaluables",
      vaultId,
      ids: valuablesRes?.data?.prepIds || [],
    });
    await deleteCreatedRows({
      supabase,
      table: "valuables",
      vaultId,
      ids: valuablesRes?.data?.createdIds || [],
    });
    await restorePrepRows({
      supabase,
      table: "preptreasures",
      vaultId,
      ids: rollbacks.treasures?.prepIds || [],
    });
    await deleteCreatedRows({
      supabase,
      table: "treasures",
      vaultId,
      ids: rollbacks.treasures?.createdIds || [],
    });
    await restorePrepRows({
      supabase,
      table: "prepholdings",
      vaultId,
      ids: rollbacks.holdings?.prepIds || [],
    });
    await deleteCreatedRows({
      supabase,
      table: "holdings",
      vaultId,
      ids: rollbacks.holdings?.createdIds || [],
    });
    return valuablesRes;
  }
  rollbacks.valuables = valuablesRes.data;

  const { error } = await supabase
    .from("rewardprep")
    .update({ archived: true })
    .eq("vault_id", vaultId)
    .eq("id", rewardPrepId);

  if (error) {
    console.error("giveRewardPrepDb archive failed", error);
    await restorePrepRows({
      supabase,
      table: "prepvaluables",
      vaultId,
      ids: rollbacks.valuables?.prepIds || [],
    });
    await deleteCreatedRows({
      supabase,
      table: "valuables",
      vaultId,
      ids: rollbacks.valuables?.createdIds || [],
    });
    await restorePrepRows({
      supabase,
      table: "preptreasures",
      vaultId,
      ids: rollbacks.treasures?.prepIds || [],
    });
    await deleteCreatedRows({
      supabase,
      table: "treasures",
      vaultId,
      ids: rollbacks.treasures?.createdIds || [],
    });
    await restorePrepRows({
      supabase,
      table: "prepholdings",
      vaultId,
      ids: rollbacks.holdings?.prepIds || [],
    });
    await deleteCreatedRows({
      supabase,
      table: "holdings",
      vaultId,
      ids: rollbacks.holdings?.createdIds || [],
    });
    return { ok: false, error: "Reward could not be archived.", data: null };
  }

  return { ok: true, error: null, data: { reward_prep_id: rewardPrepId } };
}
