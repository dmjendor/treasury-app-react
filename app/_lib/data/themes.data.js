import "server-only";
import { getSupabase } from "@/app/_lib/supabase";

export async function getThemes() {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("themes").select("*");

  if (error) {
    console.error("getThemes failed", error);
    return [];
  }

  return data ?? [];
}

/**
 * - Get a theme by id.
 * @param {string} themeId
 * @returns {Promise<any|null>}
 */
export async function getThemeById(themeId) {
  if (!themeId) return null;
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("themes")
    .select("*")
    .eq("id", themeId)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) {
    console.error("getThemeById failed", error);
    return null;
  }
  return data ?? null;
}
