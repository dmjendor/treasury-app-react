// app/accounts/vaults/[vaultId]/logs/page.jsx
import { getVaultLogs } from "@/app/_lib/data/logs.data";

// These must be your shared components

import LogsControlsClient from "@/app/_components/LogsControlsCLient";
import IconComponent from "@/app/_components/IconComponent";
import { LinkButton } from "@/app/_components/LinkButton";
import { getRouteParams } from "@/app/_lib/routing/params";
import { formatChangesSummary } from "@/app/utils/loggingUtils";
import { getSearchParams } from "@/app/_lib/routing/searchParams";

function clampPage(n) {
  const x = Number(n);
  return Number.isFinite(x) && x > 0 ? x : 1;
}

function parsePageSize(n) {
  const x = Number(n);
  return [20, 50, 100].includes(x) ? x : 20;
}

function statusStyles(status) {
  if (status === "ok") return "text-accent-200 border-accent-700 bg-accent-600";
  if (status === "warning")
    return "text-warning-200 border-warning-700 bg-warning-600";
  return "text-danger-300 border-danger-700 bg-danger-600";
}

function safeJsonPreview(value) {
  if (value == null) return null;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default async function VaultLogsPage({ params, searchParams }) {
  const { vaultId } = await getRouteParams(params);
  const { pageData, pageSizeData } = await getSearchParams(searchParams);
  const page = clampPage(pageData);
  const pageSize = parsePageSize(pageSizeData);
  const result = await getVaultLogs({ vaultId, page, pageSize });
  const logs = result.ok ? result.data.logs : [];
  const total = result.ok ? result.data.total : 0;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const basePath = `/accounts/vaults/${vaultId}/logs`;

  function hrefFor(nextPage) {
    const paramsObj = new URLSearchParams();
    paramsObj.set("page", String(nextPage));
    paramsObj.set("pageSize", String(pageSize));
    return `${basePath}?${paramsObj.toString()}`;
  }

  return (
    <div className="px-6 py-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-primary-700 text-2xl">Logs</h1>
            <p className="text-primary-700 text-sm mt-1">
              Newest first. Showing {logs.length} of {total}.
            </p>
          </div>

          <LogsControlsClient
            basePath={basePath}
            pageSize={pageSize}
          />
        </div>

        {!result.ok ? (
          <div className="rounded-lg border border-danger-800 bg-primary-600 p-4">
            <p className="text-danger-200 text-sm">
              Could not load logs: {result.error}
            </p>
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
                    Action
                  </th>
                  <th className="text-left text-primary-200 text-xs font-medium px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-primary-200 text-xs font-medium px-4 py-3">
                    Change By
                  </th>
                  <th className="text-left text-primary-200 text-xs font-medium px-4 py-3">
                    Message
                  </th>
                  <th className="text-left text-primary-200 text-xs font-medium px-4 py-3">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-primary-300 text-sm"
                    >
                      No log entries found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const when = log.created_at
                      ? new Date(log.created_at).toLocaleString()
                      : "";

                    const actor = log.actor_email || "System";
                    const changesSummary = formatChangesSummary(log.changes, 2);
                    const changesPreview = safeJsonPreview(log.changes);
                    const metaPreview = safeJsonPreview(log.meta);

                    return (
                      <tr
                        key={log.id}
                        className="border-b border-primary-800 last:border-b-0"
                      >
                        <td className="px-4 py-3 text-primary-100 text-sm whitespace-nowrap">
                          {when}
                        </td>

                        <td className="px-4 py-3 text-primary-50 text-sm whitespace-nowrap">
                          {log.action}
                        </td>

                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <span
                            className={[
                              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
                              statusStyles(log.status),
                            ].join(" ")}
                          >
                            {log.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-primary-100 text-sm max-w-60 truncate">
                          {actor}
                        </td>

                        <td className="px-4 py-3 text-primary-100 text-sm max-w-130 truncate">
                          {log.message || ""}
                        </td>

                        <td className="px-4 py-3 text-sm">
                          <details className="group">
                            <summary className="cursor-pointer select-none text-accent-300 hover:text-accent-200">
                              View
                            </summary>
                            <div className="mt-3 rounded-lg border border-primary-800 bg-primary-600 p-3">
                              <div className="grid gap-3">
                                <div className="text-xs text-primary-200">
                                  <div className="flex flex-wrap gap-3">
                                    <span>id: {log.id}</span>
                                    {log.request_id ? (
                                      <span>request: {log.request_id}</span>
                                    ) : null}
                                    {log.source ? (
                                      <span>source: {log.source}</span>
                                    ) : null}
                                  </div>
                                </div>

                                {changesPreview ? (
                                  <div>
                                    <div className="text-primary-200 text-xs mb-2">
                                      changes
                                    </div>
                                    <pre className="text-primary-50 text-xs whitespace-pre-wrap wrap-break-word">
                                      {changesSummary}
                                    </pre>
                                  </div>
                                ) : null}

                                {metaPreview ? (
                                  <div>
                                    <div className="text-primary-200 text-xs mb-2">
                                      meta
                                    </div>
                                    <pre className="text-primary-50 text-xs whitespace-pre-wrap wrap-break-word">
                                      {metaPreview}
                                    </pre>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </details>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center bg-accent-600 justify-between gap-4 px-4 py-3 border-t border-primary-800">
            <p className="text-primary-200 text-sm">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <LinkButton
                href={hrefFor(Math.max(1, currentPage - 1))}
                aria-disabled={currentPage === 1}
              >
                Prev
              </LinkButton>

              <LinkButton
                href={hrefFor(Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage === totalPages}
              >
                Next
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
