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
    .from("treasures")
    .select("*")
    .eq("vault_id", vaultId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTreasuresForContainer(vaultId, containerId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("treasures")
    .select("*")
    .eq("vault_id", vaultId)
    .eq("container_id", containerId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createTreasureDb(treasureObj) {
  console.log(treasureObj);
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("treasures")
    .insert([treasureObj])
    .select();
  console.log("e:", error);
  console.log("d:", data);
  if (error) throw new Error(error.message);
  return data;
}

export async function getDefaultTreasures(vaultId) {
  const { system_id } = await getVaultById(vaultId);

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("defaulttreasures")
    .select("*")
    .eq("system_id", system_id);

  if (error) throw new Error(error.message);
  return data;
}
