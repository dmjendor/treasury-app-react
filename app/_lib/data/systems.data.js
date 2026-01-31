import { getSupabase } from "@/app/_lib/supabase";

export async function getSystems() {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("systems").select("*");

  if (error) {
    console.error("getSystems failed", error);
    return [];
  }

  return data ?? [];
}
