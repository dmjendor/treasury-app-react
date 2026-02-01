// app/_lib/generators/valuableNames.js
// Server-only name generator for "generated valuables".
// Keep this lightweight and fun. We can expand the word banks later.

import "server-only";
import crypto from "crypto";

/**
 * @typedef {"gems"|"art"|"jewelry"|"relics"} ValuableCategoryKey
 */

/**
 * Placeholder word banks. Expand freely once the flow is working.
 * Keep entries short, evocative, and reusable.
 */
const BANKS = /** @type {const} */ ({
  gems: {
    adjective: [
      "glittering",
      "smoky",
      "star cut",
      "duskwoven",
      "sun kissed",
      "frosted",
    ],
    material: ["amber", "amethyst", "opal", "ruby", "sapphire", "emerald"],
    noun: ["gem", "stone", "shard", "tear", "chip", "cabochon"],
    detail: [
      "with a faint inner glow",
      "etched with tiny runes",
      "warm to the touch",
      "caught in spider silk cracks",
    ],
  },

  art: {
    adjective: [
      "weathered",
      "luminous",
      "haunting",
      "delicate",
      "bold",
      "ancient",
    ],
    medium: [
      "oil portrait",
      "charcoal sketch",
      "ink study",
      "bronze relief",
      "tapestry",
      "ceramic mural tile",
    ],
    subject: [
      "a forgotten duke",
      "a storm at sea",
      "a masked saint",
      "a dragon in repose",
      "a crescent moon court",
      "a laughing jester",
    ],
    detail: [
      "signed in the corner",
      "framed in dark wood",
      "smelling faintly of incense",
      "bearing a gallery seal",
    ],
  },

  jewelry: {
    adjective: [
      "engraved",
      "filigreed",
      "mirror bright",
      "tarnished",
      "pristine",
      "ornate",
    ],
    material: ["silver", "gold", "electrum", "brass", "bone", "obsidian"],
    noun: ["ring", "torc", "pendant", "bracelet", "ear cuff", "brooch"],
    motif: [
      "lion crest",
      "serpent knot",
      "sunburst",
      "thorn crown",
      "twin stars",
      "owl sigil",
    ],
    detail: [
      "set with a tiny gem",
      "with a hidden clasp",
      "balanced perfectly",
      "whispering faintly when moved",
    ],
  },

  relics: {
    adjective: [
      "votive",
      "sealed",
      "ashen",
      "sanctified",
      "war scarred",
      "timeworn",
    ],
    noun: ["idol", "tablet", "censer", "chalice", "mask", "key"],
    origin: [
      "the basilica vaults",
      "a drowned shrine",
      "the old watchtower",
      "a moonlit crypt",
      "the northern barrows",
      "the glass desert",
    ],
    detail: [
      "still dusted with pale ash",
      "cold even in sunlight",
      "marked with a warding sigil",
      "wrapped in faded velvet",
    ],
  },
});

/**
 * Public list of supported category keys.
 * @returns {ValuableCategoryKey[]}
 */
export function getValuableCategoryKeys() {
  return /** @type {ValuableCategoryKey[]} */ (Object.keys(BANKS));
}

/**
 * Generate a lightweight valuable name for a given category.
 * @param {{ categoryKey: ValuableCategoryKey }} args
 * @returns {{ name: string, description: string }}
 */
export function generateValuableName(args) {
  const bank = BANKS[args.categoryKey];
  if (!bank) {
    return {
      name: "curious trinket",
      description: "A small oddity with no clear origin.",
    };
  }

  // Category-specific assembly, so outputs feel distinct.
  switch (args.categoryKey) {
    case "gems": {
      const name = titleCase(
        joinNonEmpty([
          pick(bank.adjective),
          pick(bank.material),
          pick(bank.noun),
        ]),
      );
      const description = sentenceCase(pick(bank.detail)) + ".";
      return { name, description };
    }

    case "art": {
      const name = titleCase(
        joinNonEmpty([
          pick(bank.adjective),
          pick(bank.medium),
          "of",
          pick(bank.subject),
        ]),
      );
      const description = sentenceCase(pick(bank.detail)) + ".";
      return { name, description };
    }

    case "jewelry": {
      const name = titleCase(
        joinNonEmpty([
          pick(bank.adjective),
          pick(bank.material),
          pick(bank.noun),
          "with",
          pick(bank.motif),
        ]),
      );
      const description = sentenceCase(pick(bank.detail)) + ".";
      return { name, description };
    }

    case "relics": {
      const name = titleCase(
        joinNonEmpty([
          pick(bank.adjective),
          pick(bank.noun),
          "from",
          pick(bank.origin),
        ]),
      );
      const description = sentenceCase(pick(bank.detail)) + ".";
      return { name, description };
    }

    default: {
      // Should be unreachable, but keep it safe.
      return {
        name: "curious trinket",
        description: "A small oddity with no clear origin.",
      };
    }
  }
}

/**
 * Pick a random element from an array.
 * Uses crypto for good randomness on the server.
 * @template T
 * @param {readonly T[]} list
 * @returns {T}
 */
function pick(list) {
  if (!list.length) throw new Error("Generator bank is empty");
  const i = crypto.randomInt(0, list.length);
  return list[i];
}

/**
 * Join words with spaces, filtering empty-ish parts.
 * @param {string[]} parts
 * @returns {string}
 */
function joinNonEmpty(parts) {
  return parts
    .map((p) => String(p || "").trim())
    .filter(Boolean)
    .join(" ");
}

/**
 * Title-case a phrase without getting fancy.
 * @param {string} s
 * @returns {string}
 */
function titleCase(s) {
  return s
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ")
    .trim();
}

/**
 * Sentence-case a phrase.
 * @param {string} s
 * @returns {string}
 */
function sentenceCase(s) {
  const t = String(s || "").trim();
  if (!t) return "";
  return t[0].toUpperCase() + t.slice(1);
}
