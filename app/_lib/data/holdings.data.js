/**
 * Data: Holdings
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";
import { auth } from "@/app/_lib/auth";

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
        total_value: 0,
      };

      acc[cur.id].total_value += Number(row.value);
      return acc;
    }, {}),
  );

  totals.sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || "")),
  );
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

  if (error) throw error;
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
 * - @param {{ vaultId:string, partyMemberCount:number, keepPartyShare:boolean }} input
 * - @returns {Promise<{byCurrency:Array<{currency_id:string,total:number,shares:number,share_amount:number,remainder:number,archived_count:number,created_count:number}>}>}
 */
export const splitVaultHoldings = async function ({
  vaultId,
  partyMemberCount,
  keepPartyShare,
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

  const results = [];
  for (const currencyId of currencyIds) {
    const total = Number(totalsByCurrency[currencyId]?.total || 0);
    const ids = totalsByCurrency[currencyId]?.ids || [];

    if (total <= 0) {
      throw new Error(
        "Cannot split when a currency total is zero or negative.",
      );
    }

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

  const allIds = results.flatMap((r) => r.ids);
  const archivedCount = await archiveHoldingsEntries({ vaultId, ids: allIds });

  if (archivedCount !== allIds.length) {
    throw new Error(
      "Split failed due to concurrent changes. Please try again.",
    );
  }

  const supabase = await getSupabase();
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
};
