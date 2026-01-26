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
  try {
    const data = await listVaultLogs({ vaultId, limit, before });
    return { ok: true, error: null, data };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Could not load logs.",
      data: null,
    };
  }
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
  try {
    const data = await listEntityLogs({
      vaultId,
      entityType,
      entityId,
      limit,
      before,
    });
    return { ok: true, error: null, data };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Could not load logs.",
      data: null,
    };
  }
};

/**
 * - Add a log entry.
 * - @param {{ vaultId:string, action:string, entityType?:string, entityId?:string, changes?:any, status?:string, source?:string, message?:string, requestId?:string, meta?:any }} input
 * - @returns {Promise<{ok:boolean,error:string|null,data:any}>}
 */
export const addVaultLogAction = async function (input) {
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
