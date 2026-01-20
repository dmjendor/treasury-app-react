"use client";

import React from "react";
import { LinkButton } from "@/app/_components/LinkButton";

function fmtMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function ValuablesTable({
  vaultId,
  valuables,
  activeContainerId,
}) {
  const rows = Array.isArray(valuables) ? valuables : [];

  return (
    <div className="rounded-2xl border border-primary-700 overflow-hidden bg-primary-700 text-primary-50">
      <div className="px-4 py-3 flex items-center justify-between border-b border-primary-900">
        <div className="text-sm opacity-90">
          {rows.length} valuable item{rows.length === 1 ? "" : "s"}
        </div>

        <LinkButton
          href={`/account/vaults/${vaultId}/valuables/new${
            activeContainerId ? `?containerId=${activeContainerId}` : ""
          }`}
          variant="accent"
          size="sm"
        >
          Add
        </LinkButton>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-accent-500 border-b border-primary-900">
            <tr className="text-left text-fg">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3 w-40">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-muted-fg bg-card"
                  colSpan={5}
                >
                  No valuable in this container yet.
                </td>
              </tr>
            ) : (
              rows.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border last:border-b-0 hover:bg-surface hover:text-fg transition-colors bg-card text-muted-fg"
                >
                  <td
                    className={`px-4 py-3 font-medium ${t.magical ? "text-accent-600" : ""}`}
                  >
                    {t.name}
                  </td>
                  <td className="px-4 py-3">{fmtMoney(t.value)}</td>
                  <td className="px-4 py-3">{t.quantity ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <LinkButton
                        href={`/account/vaults/${vaultId}/valuables/${t.id}/edit`}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </LinkButton>

                      <LinkButton
                        href={`/account/vaults/${vaultId}/valuables/${t.id}/delete`}
                        variant="danger"
                        size="sm"
                      >
                        Delete
                      </LinkButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
