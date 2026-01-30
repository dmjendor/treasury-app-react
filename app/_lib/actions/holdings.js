"use server";

import { revalidatePath } from "next/cache";
import {
  getVaultCurrencyBalances,
  listUnarchivedHoldingsEntries,
  createHoldingsEntry,
  archiveHoldingsEntries,
  splitVaultHoldings,
} from "@/app/_lib/data/holdings.data";
import { getCurrenciesForVault } from "@/app/_lib/data/currencies.data";
import { normalizeCode } from "@/app/utils/currencyUtils";

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
 * - Get holdings snapshot for a vault.
 * - @param {{ vaultId:string }} input
 * - @returns {Promise<{ok:boolean,error:string|null,data:any}>}
 */
export const getHoldingsSnapshotAction = async function ({ vaultId }) {
  try {
    const [entries, currencies] = await Promise.all([
      listUnarchivedHoldingsEntries(vaultId),
      getCurrenciesForVault(vaultId),
    ]);

    const currencyMap = new Map(
      (Array.isArray(currencies) ? currencies : []).map((currency) => [
        String(currency.id),
        currency,
      ]),
    );

    const data = (entries || []).map((entry) => {
      const currency = currencyMap.get(String(entry.currency_id));
      const code = currency?.code ? normalizeCode(currency.code) : "";
      const currencyLabel = code || currency?.name || "Unknown currency";
      return {
        ...entry,
        currencyLabel,
      };
    });

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
 * - @param {{ vaultId:string, partyMemberCount:number, keepPartyShare:boolean, mergeSplit?:boolean|string }} input
 * - @returns {Promise<{ok:boolean,error:string|null,data:any}>}
 */
export const splitVaultHoldingsAction = async function ({
  vaultId,
  partyMemberCount,
  keepPartyShare,
  mergeSplit,
}) {
  try {
    const data = await splitVaultHoldings({
      vaultId,
      partyMemberCount,
      keepPartyShare,
      mergeSplit,
    });
    revalidatePath(`/account/vaults/${vaultId}/holdings`);
    revalidatePath(`/account/vaults/${vaultId}`);
    revalidatePath(`/public/vaults/${vaultId}`);
    return { ok: true, error: null, data };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Could not split holdings.",
      data: null,
    };
  }
};
