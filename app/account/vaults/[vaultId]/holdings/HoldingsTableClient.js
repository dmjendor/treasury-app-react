// app/account/vaults/[vaultId]/holdings/HoldingsTableClient.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineTrash } from "react-icons/hi2";
import { Button } from "@/app/_components/Button";
import IconComponent from "@/app/_components/IconComponent";
import { LinkButton } from "@/app/_components/LinkButton";
import LogsControlsClient from "@/app/_components/LogsControlsCLient";
import {
  archiveHoldingsEntriesAction,
  getHoldingsSnapshotAction,
} from "@/app/_lib/actions/holdings";
import { useVault } from "@/app/_context/VaultProvider";

function formatTimestamp(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "" : date.toLocaleString();
}

function formatAmount(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString() : "0";
}

/**
 * Render the holdings table with pagination and delete actions.
 * @param {{ vaultId: string, basePath: string, rows: Array<{id:string,value:number,timestamp:string,currencyLabel:string}>, pageSize: number, total: number, currentPage: number, totalPages: number }} props
 * @returns {JSX.Element}
 */
export default function HoldingsTableClient({
  vaultId,
  basePath,
  rows,
  pageSize,
  total,
  currentPage,
  totalPages,
}) {
  const router = useRouter();
  const { holdingsVersion } = useVault();
  const [tableRows, setTableRows] = useState(Array.isArray(rows) ? rows : []);
  const [deletedIds, setDeletedIds] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [localTotal, setLocalTotal] = useState(total);
  const [localTotalPages, setLocalTotalPages] = useState(totalPages);
  const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);

  useEffect(() => {
    setTableRows(Array.isArray(rows) ? rows : []);
    setDeletedIds([]);
    setLocalTotal(total);
    setLocalTotalPages(totalPages);
    setLocalCurrentPage(currentPage);
  }, [rows, total, totalPages, currentPage]);

  useEffect(() => {
    let cancelled = false;

    async function refreshHoldings() {
      if (!vaultId) return;
      setError("");
      const res = await getHoldingsSnapshotAction({ vaultId });
      if (!res?.ok) {
        if (!cancelled) {
          setError(res?.error || "Could not load holdings entries.");
        }
        return;
      }
      if (cancelled) return;
      const allRows = Array.isArray(res.data) ? res.data : [];
      const nextTotal = allRows.length;
      const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pageSize));
      const nextPage = Math.min(currentPage, nextTotalPages);
      const startIndex = (nextPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      setDeletedIds([]);
      setTableRows(allRows.slice(startIndex, endIndex));
      setLocalTotal(nextTotal);
      setLocalTotalPages(nextTotalPages);
      setLocalCurrentPage(nextPage);
    }

    refreshHoldings();

    return () => {
      cancelled = true;
    };
  }, [vaultId, holdingsVersion]);

  const displayRows = useMemo(() => {
    const list = Array.isArray(tableRows) ? tableRows : [];
    if (!deletedIds.length) return list;
    const deletedSet = new Set(deletedIds);
    return list.filter((row) => !deletedSet.has(row.id));
  }, [tableRows, deletedIds]);


  function hrefFor(nextPage) {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("pageSize", String(pageSize));
    return `${basePath}?${params.toString()}`;
  }

  async function handleDelete(entryId) {
    if (!entryId) return;

    setError("");
    setBusyId(entryId);

    setDeletedIds((prev) =>
      prev.includes(entryId) ? prev : [...prev, entryId],
    );

    const res = await archiveHoldingsEntriesAction({
      vaultId,
      ids: [entryId],
    });

    if (!res?.ok) {
      setError(res?.error || "Delete failed.");
      setDeletedIds((prev) => prev.filter((id) => id !== entryId));
      setBusyId("");
      return;
    }

    setBusyId("");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-fg">
          Page {localCurrentPage} of {localTotalPages} (Total: {localTotal})
        </p>

        <LogsControlsClient
          basePath={basePath}
          pageSize={pageSize}
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-danger-800 bg-primary-600 p-4">
          <p className="text-danger-200 text-sm">{error}</p>
        </div>
      ) : null}

      <div className="rounded-xl border border-primary-800 bg-primary-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-accent-600">
              <tr className="border-b border-primary-800">
                <th className="text-left text-primary-200 text-xs font-medium px-4 py-3">
                  Time
                </th>
                <th className="text-left text-primary-200 text-xs font-medium px-4 py-3">
                  Value
                </th>
                <th className="text-left text-primary-200 text-xs font-medium px-4 py-3">
                  Currency
                </th>
                <th className="text-right text-primary-200 text-xs font-medium px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {displayRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-primary-300 text-sm"
                  >
                    No holdings entries found.
                  </td>
                </tr>
              ) : (
                displayRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-primary-800 last:border-b-0"
                  >
                    <td className="px-4 py-3 text-primary-100 text-sm whitespace-nowrap">
                      {formatTimestamp(row.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-primary-50 text-sm">
                      {formatAmount(row.value)}
                    </td>
                    <td className="px-4 py-3 text-primary-50 text-sm">
                      {row.currencyLabel}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        disabled={busyId === row.id}
                        onClick={() => handleDelete(row.id)}
                        className="inline-flex items-center gap-2"
                        aria-label="Delete holding"
                        title="Delete holding"
                      >
                        <IconComponent icon={HiOutlineTrash} />
                        <span className="hidden sm:inline">
                          {busyId === row.id ? "Deleting..." : "Delete"}
                        </span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center bg-accent-600 justify-between gap-4 px-4 py-3 border-t border-primary-800">
          <p className="text-primary-200 text-sm">
            Page {localCurrentPage} of {localTotalPages}
          </p>

          <div className="flex items-center gap-2">
            <LinkButton
              href={hrefFor(Math.max(1, localCurrentPage - 1))}
              aria-disabled={localCurrentPage === 1}
            >
              Prev
            </LinkButton>

            <LinkButton
              href={hrefFor(Math.min(localTotalPages, localCurrentPage + 1))}
              aria-disabled={localCurrentPage === localTotalPages}
            >
              Next
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
