/**
 * app/_lib/supabase.js
 *
 * Supabase client for server-side usage.
 * Lazily initialized to avoid dev-mode rebuild timing issues where process.env
 * may briefly read as undefined during module evaluation.
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";

let _client = null;

/**
 * getSupabase
 *
 * Returns a singleton Supabase client for server-side calls.
 * Throws a clear error if required env vars are missing.
 */
export function getSupabase() {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    // Keep the error message explicit so it’s obvious what’s missing.
    throw new Error(
      "Supabase env vars missing. Expected SUPABASE_URL and SUPABASE_KEY in .env.local"
    );
  }

  _client = createClient(url, key);
  return _client;
}
