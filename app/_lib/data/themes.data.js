import { getSupabase } from "@/app/_lib/supabase";

export async function getThemes() {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("themes").select("*");

  if (error) throw new Error("Themes could not be loaded");

  return data;
}
