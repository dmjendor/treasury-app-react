/**
 * Data: Treasures
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";
import { getVaultById } from "@/app/_lib/data/vaults.data";

export async function getTreasuresForVault(vaultId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("treasure")
    .select("*")
    .eq("vault_id", vaultId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTreasuresForContainer(vaultId, containerId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("treasure")
    .select("*")
    .eq("vault_id", vaultId)
    .eq("container_id", containerId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createTreasureDb(treasureObj) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("treasure")
    .insert([treasureObj])
    .select();
  if (error) throw new Error(error.message);
  return data;
}

export async function getDefaultTreasures(vaultId) {
  const { edition_id } = await getVaultById(vaultId);

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("defaulttreasures")
    .select("*")
    .eq("edition_id", edition_id);
  if (error) throw new Error(error.message);
  return data;
}
