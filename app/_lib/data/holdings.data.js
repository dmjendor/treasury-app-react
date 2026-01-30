/**
 * Data: Holdings
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";
import { auth } from "@/app/_lib/auth";
import { getVaultById } from "@/app/_lib/data/vaults.data";

function toNumber(value, fallback = null) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function sortByRateDesc(a, b) {
  const left = toNumber(a?.rate, 0);
  const right = toNumber(b?.rate, 0);
  return right - left;
}

async function confirmAllArchived({ supabase, vaultId, ids }) {
  if (!Array.isArray(ids) || ids.length === 0) return true;
  const { data, error } = await supabase
    .from("holdings")
    .select("id")
    .eq("vault_id", vaultId)
    .eq("archived", false)
    .in("id", ids);
  if (error) throw error;
  return (data || []).length === 0;
}

/**
 * - Get currency balances for a vault from unarchived holdings entries.
 * - @param {string} vaultId
 * - @returns {Promise<Array<{currency_id:string,name:string,code:string,total_value:number}>>}
 */
export const getVaultCurrencyBalances = async function (vaultId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("holdings")
    .select(
      `
        value,
        currencies:currency_id (
          id,
          name,
          rate,
          code
        )
      `,
    )
    .eq("vault_id", vaultId)
    .eq("archived", false);

  if (error) throw error;

  const totals = Object.values(
    (data || []).reduce((acc, row) => {
      const cur = row.currencies;
      if (!cur) return acc;

      acc[cur.id] ??= {
        currency_id: cur.id,
        name: cur.name,
        code: cur.code,
        rate: cur.rate,
        total_value: 0,
      };

      acc[cur.id].total_value += Number(row.value);
      return acc;
    }, {}),
  );

  totals.sort((a, b) => a.rate - b.rate);
  return totals;
};

/**
 * - List unarchived holdings entries for a vault.
 * - @param {string} vaultId
 * - @returns {Promise<Array<{id:string,value:number,currency_id:string,timestamp:string,changeby:string|null}>>}
 */
export const listUnarchivedHoldingsEntries = async function (vaultId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("holdings")
    .select("id,value,currency_id,timestamp,changeby")
    .eq("vault_id", vaultId)
    .eq("archived", false)
    .order("timestamp", { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * - Create a holdings entry for a vault.
 * - @param {{ vaultId:string, currencyId:string, value:number }} input
 * - @returns {Promise<{id:string,value:number,currency_id:string,vault_id:string,archived:boolean,timestamp:string}>}
 */
export const createHoldingsEntry = async function ({
  vaultId,
  currencyId,
  value,
}) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue))
    throw new Error("Value must be a number.");

  const supabase = await getSupabase();
  const userId = session?.user?.userId || null;

  const { data, error } = await supabase
    .from("holdings")
    .insert({
      vault_id: vaultId,
      currency_id: currencyId,
      value: numericValue,
      archived: false,
      changeby: userId,
      timestamp: new Date().toISOString(),
    })
    .select("id,value,currency_id,vault_id,archived,timestamp")
    .single();

  if (error) throw error;
  return data;
};

/**
 * - Archive holdings entries by id for a vault.
 * - @param {{ vaultId:string, ids:string[] }} input
 * - @returns {Promise<number>}
 */
export const archiveHoldingsEntries = async function ({ vaultId, ids }) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");
  if (!Array.isArray(ids) || ids.length === 0) return 0;

  const supabase = await getSupabase();

  const { count, error } = await supabase
    .from("holdings")
    .update({ archived: true })
    .eq("vault_id", vaultId)
    .eq("archived", false)
    .in("id", ids)
    .select("id", { count: "exact" });

  if (error) {
    console.log(error);
  }
  return Number(count || 0);
};

/**
 * - Get unarchived holdings totals per currency for a vault.
 * - @param {string} vaultId
 * - @returns {Promise<Record<string, { currency_id:string, total:number, ids:string[] }>>}
 */
export const getUnarchivedTotalsByCurrency = async function (vaultId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("holdings")
    .select("id,currency_id,value")
    .eq("vault_id", vaultId)
    .eq("archived", false);

  if (error) throw error;

  const map = {};
  for (const row of data || []) {
    const currencyId = row.currency_id;
    map[currencyId] ??= { currency_id: currencyId, total: 0, ids: [] };
    map[currencyId].total += Number(row.value);
    map[currencyId].ids.push(row.id);
  }
  return map;
};

/**
 * - Split unarchived holdings totals for a vault into equal shares and archive the consumed entries.
 * - @param {{ vaultId:string, partyMemberCount:number, keepPartyShare:boolean, mergeSplit?:boolean|string }} input
 * - @returns {Promise<{byCurrency:Array<{currency_id:string,total?:number,shares:number,share_amount:number,remainder?:number,archived_count:number,created_count:number}>}>}
 */
export const splitVaultHoldings = async function ({
  vaultId,
  partyMemberCount,
  keepPartyShare,
  mergeSplit,
}) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  const members = Number(partyMemberCount);
  if (!Number.isInteger(members) || members <= 0) {
    throw new Error("Party member count must be a positive integer.");
  }

  const totalsByCurrency = await getUnarchivedTotalsByCurrency(vaultId);
  const currencyIds = Object.keys(totalsByCurrency);

  if (currencyIds.length === 0) {
    return { byCurrency: [] };
  }

  const shares = members + (keepPartyShare ? 1 : 0);
  const mergeAll = mergeSplit === true || mergeSplit === "base";

  if (!mergeAll) {
    const results = [];
    for (const currencyId of currencyIds) {
      const total = Number(totalsByCurrency[currencyId]?.total || 0);
      const ids = totalsByCurrency[currencyId]?.ids || [];

      if (total > 0) {
        const shareAmount = Math.floor(total / shares);
        const remainder = total - shareAmount * shares;

        results.push({
          currency_id: currencyId,
          total,
          shares,
          share_amount: shareAmount,
          remainder,
          ids,
        });
      }
    }

    const allIds = results.flatMap((r) => r.ids);
    const archivedCount = await archiveHoldingsEntries({
      vaultId,
      ids: allIds,
    });

    const supabase = await getSupabase();
    if (archivedCount !== allIds.length) {
      const cleared = await confirmAllArchived({
        supabase,
        vaultId,
        ids: allIds,
      });
      if (!cleared) {
        throw new Error(
          "Split failed due to concurrent changes. Please try again.",
        );
      }
    }
    const userId = session?.user?.userId || null;

    const newRows = [];
    for (const r of results) {
      if (keepPartyShare && r.share_amount > 0) {
        newRows.push({
          vault_id: vaultId,
          currency_id: r.currency_id,
          value: r.share_amount,
          archived: false,
          changeby: userId,
          timestamp: new Date().toISOString(),
        });
      }
      if (r.remainder > 0) {
        newRows.push({
          vault_id: vaultId,
          currency_id: r.currency_id,
          value: r.remainder,
          archived: false,
          changeby: userId,
          timestamp: new Date().toISOString(),
        });
      }
    }

    let createdCount = 0;
    if (newRows.length > 0) {
      const { data: created, error: insertError } = await supabase
        .from("holdings")
        .insert(newRows)
        .select("id");
      if (insertError) throw insertError;
      createdCount = (created || []).length;
    }

    const byCurrency = results.map((r) => ({
      currency_id: r.currency_id,
      total: r.total,
      shares: r.shares,
      share_amount: r.share_amount,
      remainder: r.remainder,
      archived_count: r.ids.length,
      created_count:
        (keepPartyShare && r.share_amount > 0 ? 1 : 0) +
        (r.remainder > 0 ? 1 : 0),
    }));

    return {
      byCurrency,
      archived_count: archivedCount,
      created_count: createdCount,
    };
  }

  const vault = await getVaultById(vaultId);
  const currencies = Array.isArray(vault?.currencyList)
    ? vault.currencyList
    : [];

  const currencyMap = new Map(
    (Array.isArray(currencies) ? currencies : []).map((currency) => [
      String(currency.id),
      currency,
    ]),
  );

  const baseCurrency =
    currencyMap.get(String(vault?.base_currency_id)) ||
    (Array.isArray(currencies)
      ? currencies.find((currency) => toNumber(currency?.rate) === 1)
      : null);

  if (!baseCurrency) {
    throw new Error("A base currency (rate = 1) is required to merge splits.");
  }

  let totalBase = 0;
  for (const currencyId of currencyIds) {
    const total = toNumber(totalsByCurrency[currencyId]?.total, 0);
    const currency = currencyMap.get(String(currencyId));
    const rate = toNumber(currency?.rate);

    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error("All currencies need a valid rate to merge holdings.");
    }

    totalBase += total * rate;
  }

  const shareBase = totalBase / shares;
  const sortedCurrencies = [...(currencies || [])].sort(sortByRateDesc);

  let remaining = shareBase;
  const perShare = [];

  for (const currency of sortedCurrencies) {
    const rate = toNumber(currency?.rate);
    if (!Number.isFinite(rate) || rate <= 0) continue;
    const qty = Math.floor(remaining / rate);
    if (qty > 0) {
      perShare.push({
        currency_id: currency.id,
        rate,
        share_amount: qty,
      });
      remaining -= qty * rate;
    }
  }

  const remainderRaw = Math.max(0, remaining * shares);
  const totalRemainderBase = remainderRaw > 1e-6 ? remainderRaw : 0;

  const allIds = currencyIds.flatMap(
    (currencyId) => totalsByCurrency[currencyId]?.ids || [],
  );

  const supabase = await getSupabase();
  const archivedCount = await archiveHoldingsEntries({ vaultId, ids: allIds });

  if (archivedCount !== allIds.length) {
    const cleared = await confirmAllArchived({
      supabase,
      vaultId,
      ids: allIds,
    });
    if (!cleared) {
      throw new Error(
        "Split failed due to concurrent changes. Please try again.",
      );
    }
  }
  const userId = session?.user?.userId || null;

  const newRows = [];
  if (keepPartyShare) {
    for (const r of perShare) {
      if (r.share_amount > 0) {
        newRows.push({
          vault_id: vaultId,
          currency_id: r.currency_id,
          value: r.share_amount,
          archived: false,
          changeby: userId,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  if (totalRemainderBase > 0) {
    newRows.push({
      vault_id: vaultId,
      currency_id: baseCurrency.id,
      value: totalRemainderBase,
      archived: false,
      changeby: userId,
      timestamp: new Date().toISOString(),
    });
  }

  let createdCount = 0;
  if (newRows.length > 0) {
    const { data: created, error: insertError } = await supabase
      .from("holdings")
      .insert(newRows)
      .select("id");
    if (insertError) throw insertError;
    createdCount = (created || []).length;
  }

  const byCurrency = perShare.map((r) => ({
    currency_id: r.currency_id,
    shares,
    share_amount: r.share_amount,
    archived_count: totalsByCurrency[r.currency_id]?.ids?.length || 0,
    created_count: keepPartyShare && r.share_amount > 0 ? 1 : 0,
  }));

  return {
    byCurrency,
    archived_count: archivedCount,
    created_count: createdCount,
  };
};
