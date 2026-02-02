/**
 * Actions Utils
 * Server only helpers for actions.
 */

"use server";

/**
 * Convert FormData into a plain object.
 * @param {FormData} formData
 * @returns {Record<string, any>}
 */
export async function formDataToObject(formData) {
  const obj = {};
  for (const [k, v] of formData.entries()) obj[k] = v;
  return obj;
}

/**
 * Convert typical checkbox values to boolean.
 * @param {any} v
 * @returns {boolean}
 */
export async function toBool(v) {
  return v === true || v === "true" || v === "on" || v === "1";
}

/**
 * Sanitize a user provided text input.
 * @param {any} text
 * @returns {string}
 */
export async function cleanInputs(text) {
  let value = typeof text === "string" ? text.trim() : "";

  // Remove null bytes + most control chars (keep tab/newline/carriage return)
  value = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

  // Cap length
  if (value.length > 1000) value = value.slice(0, 1000);

  return value;
}

/**
 * Require a logged in session and return userId.
 * @param {() => Promise<any>} authFn
 * @returns {Promise<string>}
 */
export async function requireUserId(authFn) {
  const session = await authFn();
  if (!session) {
    console.error("requireUserId failed: no session");
    return null;
  }

  const userId = session?.user?.userId;
  if (!userId) {
    console.error("requireUserId failed: missing user id");
    return null;
  }

  return userId;
}

export async function toCamelCase(str) {
  return str
    .trim()
    .split(/\s+/)
    .map((word, i) => {
      const w = word.toLowerCase();
      return i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join("");
}
