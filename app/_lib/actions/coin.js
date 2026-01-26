"use server";

import {
  getVaultCurrencyBalances,
  listUnarchivedCoinEntries,
  createCoinEntry,
  archiveCoinEntries,
  splitVaultCoin,
} from "@/app/_lib/data/coin.data";

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
 * - List unarchived coin entries for a vault.
 * - @param {{ vaultId:string }} input
 * - @returns {Promise<{ok:boolean,error:string|null,data:any}>}
 */
export const listUnarchivedCoinEntriesAction = async function ({ vaultId }) {
  try {
    const data = await listUnarchivedCoinEntries(vaultId);
    return { ok: true, error: null, data };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Could not load coin entries.",
      data: null,
    };
  }
};

/**
 * - Create a coin entry for a vault.
 * - @param {{ vaultId:string, currencyId:string, value:number }} input
 * - @returns {Promise<{ok:boolean,error:string|null,data:any}>}
 */
export const createCoinEntryAction = async function ({
  vaultId,
  currencyId,
  value,
}) {
  try {
    const data = await createCoinEntry({ vaultId, currencyId, value });
    return { ok: true, error: null, data };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Could not create coin entry.",
      data: null,
    };
  }
};

/**
 * - Archive coin entries by id for a vault.
 * - @param {{ vaultId:string, ids:string[] }} input
 * - @returns {Promise<{ok:boolean,error:string|null,data:any}>}
 */
export const archiveCoinEntriesAction = async function ({ vaultId, ids }) {
  try {
    const count = await archiveCoinEntries({ vaultId, ids });
    return { ok: true, error: null, data: { archivedCount: count } };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Could not archive coin entries.",
      data: null,
    };
  }
};

/**
 * - Split unarchived coin totals and archive consumed entries.
 * - @param {{ vaultId:string, partyMemberCount:number, keepPartyShare:boolean }} input
 * - @returns {Promise<{ok:boolean,error:string|null,data:any}>}
 */
export const splitVaultCoinAction = async function ({
  vaultId,
  partyMemberCount,
  keepPartyShare,
}) {
  try {
    const data = await splitVaultCoin({
      vaultId,
      partyMemberCount,
      keepPartyShare,
    });
    return { ok: true, error: null, data };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Could not split coin.",
      data: null,
    };
  }
};
