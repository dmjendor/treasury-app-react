/**
 * Data: Logs
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";
import { auth } from "@/app/_lib/auth";

/**
 * - Create a log entry in a vault.
 * - @param {{ vaultId:string, action:string, entityType?:string, entityId?:string, changes?:any, status?:string, source?:string, message?:string, requestId?:string, meta?:any }} input
 * - @returns {Promise<any>}
 */
export const createVaultLog = async function (input) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  const supabase = await getSupabase();

  const actorUserId = session?.user?.userId || null;
  const actorEmail = session?.user?.email || null;

  const row = {
    vault_id: input.vaultId,
    actor_user_id: actorUserId,
    actor_email: actorEmail,
    action: input.action || "unknown",
    entity_type: input.entityType || null,
    entity_id: input.entityId || null,
    changes: input.changes ?? null,
    status: input.status || "ok",
    source: input.source || null,
    message: input.message || null,
    request_id: input.requestId || null,
    meta: input.meta ?? null,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("logs")
    .insert(row)
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

/**
 * - Create a log entry without throwing.
 * - @param {{ vaultId:string, action:string, entityType?:string, entityId?:string, changes?:any, status?:string, source?:string, message?:string, requestId?:string, meta?:any }} input
 * - @returns {Promise<{ok:boolean,error:string|null,data:any}>}
 */
export const tryCreateVaultLog = async function (input) {
  try {
    const data = await createVaultLog(input);
    return { ok: true, error: null, data };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Could not write log.",
      data: null,
    };
  }
};

/**
 * - List logs for a vault.
 * - @param {{ vaultId:string, limit?:number, before?:string }} input
 * - @returns {Promise<any[]>}
 */
export const listVaultLogs = async function ({ vaultId, limit = 50, before }) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  const supabase = await getSupabase();

  let q = supabase
    .from("logs")
    .select("*")
    .eq("vault_id", vaultId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    q = q.lt("created_at", before);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
};

/**
 * - List logs for a specific entity in a vault.
 * - @param {{ vaultId:string, entityType:string, entityId:string, limit?:number, before?:string }} input
 * - @returns {Promise<any[]>}
 */
export const listEntityLogs = async function ({
  vaultId,
  entityType,
  entityId,
  limit = 50,
  before,
}) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  const supabase = await getSupabase();

  let q = supabase
    .from("logs")
    .select("*")
    .eq("vault_id", vaultId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    q = q.lt("created_at", before);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
};

/**
 * - Get a single log entry by id.
 * - @param {{ id:string }} input
 * - @returns {Promise<any>}
 */
export const getLogById = async function ({ id }) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("logs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * - Build a logger helper for a vault and source.
 * - @param {{ vaultId:string, source:string, requestId?:string }} input
 * - @returns {Promise<(entry: {action:string, entityType?:string, entityId?:string, changes?:any, status?:string, message?:string, meta?:any}) => Promise<void>>}
 */
export const createVaultLogger = async function ({
  vaultId,
  source,
  requestId,
}) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  return async function (entry) {
    await tryCreateVaultLog({
      vaultId,
      source,
      requestId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      changes: entry.changes,
      status: entry.status,
      message: entry.message,
      meta: entry.meta,
    });
  };
};

/**
 * Fetch paged vault logs (newest first) + total count.
 */
export async function getVaultLogs({ vaultId, page = 1, pageSize = 20 }) {
  const supabase = getSupabase();

  const safePage = Number.isFinite(+page) && +page > 0 ? +page : 1;
  const safePageSize = [20, 50, 100].includes(+pageSize) ? +pageSize : 20;

  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  // NOTE: This assumes RLS already limits rows to vault members with can_view.
  const { data, error, count } = await supabase
    .from("logs")
    .select(
      `
        id,
        vault_id,
        actor_user_id,
        actor_email,
        action,
        status,
        entity_type,
        entity_id,
        request_id,
        changes,
        meta,
        message,
        source,
        created_at
      `,
      { count: "exact" },
    )
    .eq("vault_id", vaultId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { ok: false, error: error.message, data: { logs: [], total: 0 } };
  }

  return {
    ok: true,
    error: null,
    data: {
      logs: data ?? [],
      total: count ?? 0,
      page: safePage,
      pageSize: safePageSize,
    },
  };
}
