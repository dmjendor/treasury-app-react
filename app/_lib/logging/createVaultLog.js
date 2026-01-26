import { auth } from "@/app/_lib/auth";
import { changesFromDiff } from "@/app/utils/loggingUtils";

/**
 * Build a log input with actor info from NextAuth and formatted changes.
 * This returns a plain object you can pass to tryCreateVaultLog.
 */
export async function buildVaultLogInput({
  vaultId,
  source,
  action,
  entityType = null,
  entityId = null,
  status = "ok",
  message = null,
  requestId = null,
  meta = null,

  // One of:
  changes = null, // already formatted changes array or any json you want to store
  before = null,
  after = null,
  labels = null,
}) {
  const session = await auth();

  const actorUserId = session?.user?.userId ?? null;
  const actorEmail = session?.user?.email ?? null;

  let finalChanges = changes ?? null;

  // If before/after provided, prefer diff format for GM friendly display
  if (before && after) {
    finalChanges = changesFromDiff({
      before,
      after,
      labels: labels || {},
    });
  }

  return {
    vaultId,
    source,
    action,
    entityType,
    entityId,
    status,
    message,
    requestId,
    meta,
    changes: finalChanges,

    actorUserId,
    actorEmail,
  };
}

/**
 * Fire and forget wrapper.
 * Logging must never break the calling flow.
 */
export async function safeCreateVaultLog({ tryCreateVaultLog, input }) {
  try {
    return await tryCreateVaultLog(input);
  } catch {
    return { ok: false, error: "log_failed", data: null };
  }
}
