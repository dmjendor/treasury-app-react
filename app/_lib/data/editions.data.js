import { getSupabase } from "@/app/_lib/supabase";

export async function getEditions() {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("editions").select("*");

  if (error) throw new Error("Editions could not be loaded");

  return data;
}
