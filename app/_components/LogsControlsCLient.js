"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LogsControlsClient({ basePath, pageSize }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const options = useMemo(() => [20, 50, 100], []);

  function setParam(nextPageSize) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", String(nextPageSize));
    params.set("page", "1"); // changing page size resets paging to page 1
    router.push(`${basePath}?${params.toString()}`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-primary-600 text-sm">Rows per page</span>
      <select
        className="rounded-md border border-primary-800 bg-primary-600 text-primary-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
        value={pageSize}
        onChange={(e) => setParam(Number(e.target.value))}
        aria-label="Rows per page"
      >
        {options.map((n) => (
          <option
            key={n}
            value={n}
          >
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}
