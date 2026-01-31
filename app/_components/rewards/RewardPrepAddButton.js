/**
 * Reward prep add button.
 */
"use client";

import { LinkButton } from "@/app/_components/LinkButton";

/**
 * Render the reward prep add button.
 * @param {{ vaultId: string, className?: string }} props
 * @returns {JSX.Element}
 */
export default function RewardPrepAddButton({ vaultId, className = "" }) {
  return (
    <LinkButton
      href={`/account/vaults/${vaultId}/preprewards/new`}
      variant="accent"
      size="sm"
      className={className}
      prefetch={false}
      scroll={false}
    >
      Add reward
    </LinkButton>
  );
}
