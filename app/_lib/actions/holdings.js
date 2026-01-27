"use server";

import {
  getVaultCurrencyBalances,
  listUnarchivedHoldingsEntries,
  createHoldingsEntry,
  archiveHoldingsEntries,
  splitVaultHoldings,
} from "@/app/_lib/data/holdings.data";

/**
 * - Get currency balances for a vault.
 * - @param {{ vaultId:string }} input
 * - @returns {Promise<{ok:boolean,error:string|null,data:any}>}
 */
export const getVaultCurrencyBalancesAction = async function ({ vaultId }) {
  try {
    const data = await getVaultCurrencyBalances(vaultId);
    return { ok: true, error: null, data };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Could not load balances.",
      data: null,
    };
  }
};

/**
 * - List unarchived holdings entries for a vault.
 * - @param {{ vaultId:string }} input
 * - @returns {Promise<{ok:boolean,error:string|null,data:any}>}
 */
export const listUnarchivedHoldingsEntriesAction = async function ({
  vaultId,
}) {
  try {
    const data = await listUnarchivedHoldingsEntries(vaultId);
    return { ok: true, error: null, data };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Could not load holdings entries.",
      data: null,
    };
  }
};

/**
 * - Create a holdings entry for a vault.
 * - @param {{ vaultId:string, currencyId:string, value:number }} input
 * - @returns {Promise<{ok:boolean,error:string|null,data:any}>}
 */
export const createHoldingsEntryAction = async function ({
  vaultId,
  currencyId,
  value,
}) {
  try {
    const data = await createHoldingsEntry({ vaultId, currencyId, value });
    return { ok: true, error: null, data };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Could not create holdings entry.",
      data: null,
    };
  }
};

/**
 * - Archive holdings entries by id for a vault.
 * - @param {{ vaultId:string, ids:string[] }} input
 * - @returns {Promise<{ok:boolean,error:string|null,data:any}>}
 */
export const archiveHoldingsEntriesAction = async function ({ vaultId, ids }) {
  try {
    const count = await archiveHoldingsEntries({ vaultId, ids });
    return { ok: true, error: null, data: { archivedCount: count } };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Could not archive holdings entries.",
      data: null,
    };
  }
};

/**
 * - Split unarchived holdings totals and archive consumed entries.
 * - @param {{ vaultId:string, partyMemberCount:number, keepPartyShare:boolean }} input
 * - @returns {Promise<{ok:boolean,error:string|null,data:any}>}
 */
export const splitVaultHoldingsAction = async function ({
  vaultId,
  partyMemberCount,
  keepPartyShare,
}) {
  try {
    const data = await splitVaultHoldings({
      vaultId,
      partyMemberCount,
      keepPartyShare,
    });
    return { ok: true, error: null, data };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Could not split holdings.",
      data: null,
    };
  }
};
