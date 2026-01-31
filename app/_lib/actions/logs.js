"use server";

import {
  listVaultLogs,
  listEntityLogs,
  createVaultLog,
} from "@/app/_lib/data/logs.data";

/**
 * - Get vault logs for display.
 * - @param {{ vaultId:string, limit?:number, before?:string }} input
 * - @returns {Promise<{ok:boolean,error:string|null,data:any}>}
 */
export const getVaultLogsAction = async function ({ vaultId, limit, before }) {
  const result = await listVaultLogs({ vaultId, limit, before });
  if (!result?.ok) {
    return {
      ok: false,
      error: result?.error || "Could not load logs.",
      data: null,
    };
  }
  return { ok: true, error: null, data: result.data };
};

/**
 * - Get logs for a single entity.
 * - @param {{ vaultId:string, entityType:string, entityId:string, limit?:number, before?:string }} input
 * - @returns {Promise<{ok:boolean,error:string|null,data:any}>}
 */
export const getEntityLogsAction = async function ({
  vaultId,
  entityType,
  entityId,
  limit,
  before,
}) {
  const result = await listEntityLogs({
    vaultId,
    entityType,
    entityId,
    limit,
    before,
  });
  if (!result?.ok) {
    return {
      ok: false,
      error: result?.error || "Could not load logs.",
      data: null,
    };
  }
  return { ok: true, error: null, data: result.data };
};

/**
 * - Add a log entry.
 * - @param {{ vaultId:string, action:string, entityType?:string, entityId?:string, changes?:any, status?:string, source?:string, message?:string, requestId?:string, meta?:any }} input
 * - @returns {Promise<{ok:boolean,error:string|null,data:any}>}
 */
export const addVaultLogAction = async function (input) {
  const result = await createVaultLog(input);
  if (!result?.ok) {
    return {
      ok: false,
      error: result?.error || "Could not write log.",
      data: null,
    };
  }
  return { ok: true, error: null, data: result.data };
};
