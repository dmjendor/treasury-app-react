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
 * Logs a clear error if required env vars are missing.
 */
export function getSupabase() {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    console.error(
      "Supabase env vars missing. Expected SUPABASE_URL and SUPABASE_KEY in .env.local",
    );

    const nullResult = {
      data: null,
      error: {
        message: "Supabase is not configured.",
        code: "SUPABASE_NOT_CONFIGURED",
      },
      count: null,
    };

    const createNullQuery = () => {
      const builder = {
        select: () => builder,
        insert: () => builder,
        update: () => builder,
        delete: () => builder,
        upsert: () => builder,
        eq: () => builder,
        neq: () => builder,
        not: () => builder,
        is: () => builder,
        in: () => builder,
        or: () => builder,
        order: () => builder,
        limit: () => builder,
        range: () => builder,
        lt: () => builder,
        gt: () => builder,
        gte: () => builder,
        lte: () => builder,
        single: () => builder,
        maybeSingle: () => builder,
        then: (resolve, reject) =>
          Promise.resolve(nullResult).then(resolve, reject),
        catch: (reject) => Promise.resolve(nullResult).catch(reject),
        finally: (fn) => Promise.resolve(nullResult).finally(fn),
      };
      return builder;
    };

    return {
      from: () => createNullQuery(),
    };
  }

  _client = createClient(url, key);
  return _client;
}
