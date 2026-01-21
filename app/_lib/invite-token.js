import crypto from "crypto";

function base64urlEncode(input) {
  return Buffer.from(input).toString("base64url");
}

function base64urlDecode(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(payloadJson, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(payloadJson)
    .digest("base64url");
}

/**
 * Create an invite token.
 * Payload fields:
 * - vault_id
 * - email
 * - permission_id (optional)
 * - exp (unix seconds)
 */
export function createInviteToken(payload) {
  const secret = process.env.INVITE_SECRET;
  if (!secret) throw new Error("Missing INVITE_SECRET.");

  const json = JSON.stringify(payload);
  const body = base64urlEncode(json);
  const sig = sign(body, secret);

  return `${body}.${sig}`;
}

export function verifyInviteToken(token) {
  const secret = process.env.INVITE_SECRET;
  if (!secret) throw new Error("Missing INVITE_SECRET.");

  if (!token || typeof token !== "string") {
    return { ok: false, error: "Invalid token." };
  }

  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, error: "Invalid token." };

  const [body, sig] = parts;
  const expected = sign(body, secret);

  // timing safe compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, error: "Invalid token." };
  }

  let payload;
  try {
    payload = JSON.parse(base64urlDecode(body));
  } catch {
    return { ok: false, error: "Invalid token." };
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload?.exp || now > Number(payload.exp)) {
    return { ok: false, error: "Invite link expired." };
  }

  if (!payload?.vault_id || !payload?.email) {
    return { ok: false, error: "Invalid token." };
  }

  return { ok: true, data: payload };
}
