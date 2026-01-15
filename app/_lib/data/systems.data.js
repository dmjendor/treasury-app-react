import { getSupabase } from "@/app/_lib/supabase";

export async function getSystems() {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("systems").select("*");

  if (error) throw new Error("Systems could not be loaded");

  return data;
}
