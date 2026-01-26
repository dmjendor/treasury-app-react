// app/_lib/logging/changes.js

function normalizeValue(value) {
  if (value instanceof Date) return value.toISOString();
  return value;
}

export function changeSet(field, from, to, label) {
  return {
    op: "set",
    field,
    from: normalizeValue(from),
    to: normalizeValue(to),
    label: label || field,
  };
}

export function changeAdd(field, value, label) {
  return {
    op: "add",
    field,
    value: normalizeValue(value),
    label: label || field,
  };
}

export function changeRemove(field, value, label) {
  return {
    op: "remove",
    field,
    value: normalizeValue(value),
    label: label || field,
  };
}

/**
 * Build a changes array from a simple before after object pair.
 * Only emits set ops for fields that differ.
 */
export function changesFromDiff({ before = {}, after = {}, labels = {} }) {
  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);

  const out = [];
  for (const key of allKeys) {
    const a = before?.[key];
    const b = after?.[key];

    const same = Object.is(a, b);
    if (same) continue;

    out.push(changeSet(key, a, b, labels[key] || key));
  }

  return out;
}

function compact(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function formatChangeLine(c) {
  if (!c || !c.op) return "";

  const label = c.label || c.field || "Change";

  if (c.op === "set") {
    const from = compact(c.from);
    const to = compact(c.to);

    if (from === "" && to !== "") return `${label} set to ${to}`;
    if (from !== "" && to === "") return `${label} cleared`;
    return `${label} changed from ${from} to ${to}`;
  }

  if (c.op === "add") {
    return `${label} added ${compact(c.value)}`;
  }

  if (c.op === "remove") {
    return `${label} removed ${compact(c.value)}`;
  }

  return `${label} updated`;
}

export function formatChangesSummary(changes, maxLines = 2) {
  if (!Array.isArray(changes) || changes.length === 0) return "";

  const lines = changes.map(formatChangeLine).filter(Boolean);

  if (lines.length <= maxLines) return lines.join(" • ");

  const head = lines.slice(0, maxLines).join(" • ");
  return `${head} • plus ${lines.length - maxLines} more`;
}
