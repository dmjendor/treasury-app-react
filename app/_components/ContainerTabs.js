"use client";

import React from "react";
import { LinkButton } from "@/app/_components/LinkButton";
import { Button } from "@/app/_components/Button";

export default function ContainerTabs({
  containers,
  activeId,
  onChange,
  vaultId,
}) {
  const list = Array.isArray(containers) ? containers : [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {list.length === 0 ? (
        <div className="text-sm text-(--muted-fg)">No containers yet.</div>
      ) : (
        list.map((c) => {
          const isActive = c.id === activeId;

          return (
            <Button
              key={c.id}
              variant={isActive ? "primary" : "outline"}
              size="sm"
              onClick={() => onChange(c.id)}
              title={c.name}
            >
              {c.name}
            </Button>
          );
        })
      )}

      <div className="ml-auto">
        <LinkButton
          href={`/account/vaults/${vaultId}/containers`}
          variant="outline"
          size="sm"
        >
          Manage containers
        </LinkButton>
      </div>
    </div>
  );
}
