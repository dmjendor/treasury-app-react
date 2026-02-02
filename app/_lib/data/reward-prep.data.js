/**
 * Data: Reward prep
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";

/**
 * Create a reward prep.
 * @param {{ vault_id: string, name: string, description?: string, value_unit?: string }} input
 * @returns {Promise<Array<object>>}
 */
export async function createRewardPrepDb(input) {
  const supabase = await getSupabase();
  const payload = {
    vault_id: input?.vault_id,
    name: input?.name,
    description: input?.description ?? "",
    value_unit: input?.value_unit ?? "common",
  };

  const { data, error } = await supabase
    .from("preprewards")
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
  const supabase = await getSupabase();
  const rows = Array.isArray(holdingList) ? holdingList : [];

  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from("prepholdings")
    .insert(rows)
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
  const supabase = await getSupabase();
  const rows = Array.isArray(treasureList) ? treasureList : [];

  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from("preptreasures")
    .insert(rows)
    .select();

  if (error) {
    console.error("createPrepTreasuresDb failed", error);
    return [];
  }

  return data ?? [];
}
