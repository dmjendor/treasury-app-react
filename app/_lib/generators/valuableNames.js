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
    valueTier: {
      low: [
        "dull",
        "cloudy",
        "faded",
        "fractured",
        "uneven",
        "pale",
        "rough cut",
        "imperfect",
      ],
      mid: ["clear", "bright", "well cut", "clean", "even toned", "balanced"],
      high: [
        "flawless",
        "radiant",
        "brilliant",
        "pristine",
        "master cut",
        "perfectly clear",
        "exceptional",
      ],
    },
    // Core vibe words that can sit before everything
    vibe: [
      "glittering",
      "smoky",
      "frosted",
      "sun kissed",
      "moonlit",
      "shadowed",
      "ember bright",
      "sea glass",
      "storm touched",
      "dawn pale",
      "ink dark",
      "honeyed",
      "star speckled",
      "opaline",
      "prismatic",
      "velvet black",
      "ice clear",
      "blood red",
      "forest green",
      "sky blue",
      "violet haze",
      "gold flecked",
      "silver veined",
      "crackle glazed",
      "misty",
      "glow tipped",
      "iridescent",
    ],

    // Optional color descriptors that read well with many gem types
    color: [
      "crimson",
      "scarlet",
      "rose",
      "amber",
      "citrine",
      "golden",
      "honey",
      "emerald",
      "jade",
      "teal",
      "azure",
      "sapphire",
      "indigo",
      "violet",
      "lavender",
      "amethyst",
      "smoke gray",
      "onyx",
      "pearl white",
      "opal white",
      "sea green",
      "sunset orange",
      "midnight blue",
      "storm gray",
    ],

    // Classic cuts plus a few fantasy flavored cuts
    cut: [
      "raw",
      "tumbled",
      "polished",
      "faceted",
      "brilliant cut",
      "rose cut",
      "princess cut",
      "emerald cut",
      "pear cut",
      "marquise cut",
      "oval cut",
      "cushion cut",
      "step cut",
      "cabochon",
      "star cut",
      "moon cut",
      "tear cut",
      "hex cut",
      "tri cut",
    ],

    // A sense of scale, optional
    size: [
      "pinprick",
      "tiny",
      "small",
      "palm sized",
      "thumb sized",
      "coin sized",
      "fist sized",
      "hand sized",
      "hefty",
    ],

    // Gem materials, mix of real and fantasy adjacent
    material: [
      "amethyst",
      "aquamarine",
      "carnelian",
      "chalcedony",
      "citrine",
      "diamond",
      "emerald",
      "garnet",
      "hematite",
      "jade",
      "jasper",
      "lapis lazuli",
      "malachite",
      "moonstone",
      "obsidian",
      "onyx",
      "opal",
      "pearl",
      "peridot",
      "quartz",
      "rose quartz",
      "ruby",
      "sapphire",
      "smoky quartz",
      "spinel",
      "sunstone",
      "topaz",
      "tourmaline",
      "turquoise",
      "zircon",
      "bloodstone",
      "star ruby",
      "star sapphire",
      "black opal",
      "fire opal",
      "ice quartz",
    ],

    // What kind of thing it is
    noun: [
      "gem",
      "stone",
      "shard",
      "chip",
      "sliver",
      "cabochon",
      "crystal",
      "prism",
      "teardrop",
      "bead",
      "pebble",

      // format variants
      "cluster",
      "shard cluster",
      "geode fragment",
      "crystal splinter",
      "fractured prism",
    ],

    // Optional special features that make it feel unique
    feature: [
      "with a faint inner glow",
      "with fire trapped inside",
      "with a milky swirl",
      "with starry inclusions",
      "with spider silk cracks",
      "with lightning veining",
      "with a glassy sheen",
      "with a smoky core",
      "with a perfect mirrored face",
      "with a soft pulse of warmth",
      "that hums when held",
      "that chills the air nearby",
      "that catches light like water",
      "that throws tiny rainbows",
      "that looks deeper than it should",
      "that rings like a bell when tapped",

      "with shifting colors when turned",
      "with a warm amber glow at dusk",
      "with cool blue highlights in shadow",
      "with a faint halo under torchlight",
      "with flecks that drift as it moves",
      "with a rippled internal pattern",
      "with veins like frozen lightning",
      "with a cloudy heart",
      "with crystal clear edges",
      "with a softly blurred interior",
      "with razor sharp facets",
      "with worn, rounded edges",
      "with tiny fractures that sparkle",
      "with dust sealed deep inside",
      "with a surface smooth as glass",
      "with a grainy, unpolished texture",
      "with a high polish that reflects faces",
      "with light that pools at its center",
      "with an oily rainbow sheen",
      "with a faint scent of ozone",

      "that seems heavier than it looks",
      "that feels unusually light",
      "that warms slowly in the hand",
      "that stays cool regardless of heat",
      "that vibrates faintly when dropped",
      "that rings sharply against stone",
      "that dulls sound around it",
      "that brightens noticeably at dawn",
      "that darkens when clouds gather",
      "that glows softly in moonlight",
      "that sparkles only in direct light",
      "that dims when handled too long",
    ],

    // Optional provenance, keeps it grounded in your world without a catalog
    origin: [
      "from a riverbed",
      "from a collapsed mine",
      "from a forgotten vault",
      "from a temple offering bowl",
      "from a shattered geode",
      "from a merchant prince stash",
      "from a caravan strongbox",
      "from a coastal cave",
      "from the old mountains",
      "from a sunken ruin",

      "from a deep mountain seam",
      "from a volcanic glass field",
      "from an abandoned quarry",
      "from a wind scoured plateau",
      "from a salt flat excavation",
      "from a jungle ruin cache",
      "from a noble family vault",
      "from a smuggler hideaway",
      "from a cracked marble statue",
      "from a collapsed watchtower",

      "from a flooded tunnel",
      "from a dried river delta",
      "from a glacier melt cavern",
      "from a desert trade route",
      "from a cliffside extraction site",
      "from a forested hillside dig",
      "from a ruined monastery",
      "from a sealed stone coffer",
      "from a forgotten burial mound",
      "from a partially looted tomb",

      "from beneath a city foundation",
      "from a collapsed sewer vault",
      "from an old mint storehouse",
      "from a burned out manor",
      "from a shipwreck strongbox",
      "from a reef side cave",
      "from a silted harbor floor",
      "from a borderland trading post",
      "from a remote prospectors camp",
      "from a dust choked excavation pit",
    ],
  },

  artObjects: {
    adjective: [
      "weathered",
      "luminous",
      "haunting",
      "delicate",
      "bold",
      "ancient",

      "faded",
      "vibrant",
      "somber",
      "joyful",
      "elegant",
      "severe",
      "ornate",
      "minimal",
      "dreamlike",
      "unsettling",
      "serene",
      "dramatic",
      "sun bleached",
      "smoke kissed",
      "ink stained",
      "gold leafed",
      "silver inlaid",
      "crackle glazed",
      "timeworn",
    ],

    era: [
      "late imperial",
      "early dynastic",
      "pre war",
      "restoration era",
      "high court",
      "wandering school",
      "old kingdom",
      "modernist",
      "baroque",
      "romantic",
      "classical",
      "folk",
    ],

    style: [
      "courtly",
      "folk",
      "iconic",
      "symbolist",
      "naturalist",
      "abstract",
      "geometric",
      "allegorical",
      "satirical",
      "devotional",
      "mythic",
      "nautical",
      "pastoral",
      "martial",
      "scholarly",
    ],

    medium: [
      "oil portrait",
      "charcoal sketch",
      "ink study",
      "bronze relief",
      "tapestry",
      "ceramic mural tile",

      "watercolor landscape",
      "tempera panel",
      "woodcut print",
      "etched copperplate",
      "marble bust",
      "carved idol",
      "lacquered screen panel",
      "stained glass fragment",
      "woven wall hanging",
      "illuminated manuscript page",
      "calligraphy scroll",
      "mosaic tile",
      "clay figurine",
      "ivory miniature",
      "painted mask",
      "stone stele rubbing",
    ],

    subject: [
      "a forgotten duke",
      "a storm at sea",
      "a masked saint",
      "a dragon in repose",
      "a crescent moon court",
      "a laughing jester",

      "a crowned lion",
      "a river festival",
      "a hunt in the snow",
      "a ruined tower at dusk",
      "a ship in heavy fog",
      "a battlefield memorial",
      "a veiled oracle",
      "a knight at prayer",
      "a scholar in candlelight",
      "a procession of lanterns",
      "a mountain pass",
      "a market at noon",
      "a sleeping city",
      "a duel beneath banners",
      "a banquet scene",
      "a strange constellation map",
    ],

    condition: [
      "with hairline cracks",
      "with slight water damage",
      "with a repaired tear",
      "with worn edges",
      "with soot in the folds",
      "with flaking pigment",
      "with a fresh varnish",
      "with minor warping",
      "mounted on a crooked frame",
      "carefully restored",
      "remarkably well preserved",
    ],

    provenance: [
      "from a private collection",
      "from a traveling gallery",
      "from a monastery archive",
      "from an estate sale",
      "from a ship captain’s cabin",
      "from a ruined chapel",
      "from a noble house vault",
      "from a theater prop room",
      "from a university storeroom",
      "from a borderland trader",
    ],

    detail: [
      "signed in the corner",
      "framed in dark wood",
      "smelling faintly of incense",
      "bearing a gallery seal",

      "sealed with wax on the reverse",
      "annotated in the margin",
      "backed with linen",
      "mounted with brass hooks",
      "wrapped in oilcloth",
      "numbered as part of a set",
      "showing a makers mark",
      "with a faint fingerprint in the paint",
    ],

    rareDetail: [
      "credited to a master whose works rarely surface",
      "listed in an old auction ledger",
      "rumored to have been hidden during a palace purge",
      "depicting a subject that was later erased from records",
      "paired with a matching companion piece somewhere out there",
      "with pigments that shimmer under moonlight",
      "with gold leaf so fine it seems to float",
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

      "delicately etched",
      "hammered",
      "gilded",
      "blackened",
      "silvered",
      "lacquered",
      "inlaid",
      "wire wrapped",
      "ceremonial",
      "everyday",
      "heirloom",
      "striking",
      "minimal",
      "opulent",
    ],

    valueTier: {
      low: [
        "simple",
        "worn",
        "scuffed",
        "slightly bent",
        "plain",
        "serviceable",
        "cheaply made",
      ],
      mid: [
        "well made",
        "balanced",
        "clean lined",
        "tasteful",
        "sturdy",
        "handsome",
      ],
      high: [
        "masterworked",
        "exquisite",
        "flawless",
        "gallery worthy",
        "regal",
        "museum quality",
        "astonishing",
      ],
    },

    material: [
      "silver",
      "gold",
      "electrum",
      "brass",
      "bone",
      "obsidian",

      "copper",
      "bronze",
      "iron",
      "steel",
      "platinum",
      "ivory",
      "jet",
      "mother of pearl",
      "amber",
      "glass",
      "porcelain",
      "lacquered wood",
    ],

    noun: [
      "ring",
      "torc",
      "pendant",
      "bracelet",
      "ear cuff",
      "brooch",

      "signet ring",
      "chain",
      "necklace",
      "choker",
      "armlet",
      "anklet",
      "diadem",
      "circlet",
      "locket",
      "hairpin",
      "cloak pin",
      "medallion",
    ],

    setting: [
      "bezel set",
      "prong set",
      "pavé set",
      "channel set",
      "inlaid",
      "wire wrapped",
      "flush set",
      "claw set",
    ],

    chain: [
      "on a fine chain",
      "on a heavy chain",
      "on a braided cord",
      "on a velvet ribbon",
      "on a leather thong",
      "on a linked chain",
    ],

    motif: [
      "lion crest",
      "serpent knot",
      "sunburst",
      "thorn crown",
      "twin stars",
      "owl sigil",

      "crescent moon",
      "raven feather",
      "oak leaf",
      "hammer and anvil",
      "coiled dragon",
      "sea wave",
      "crown and rose",
      "key and lock",
      "spiral rune",
      "compass star",
      "eye motif",
      "thorned vine",
    ],

    stone: [
      "amethyst",
      "aquamarine",
      "carnelian",
      "chalcedony",
      "citrine",
      "diamond",
      "emerald",
      "garnet",
      "hematite",
      "jade",
      "jasper",
      "lapis lazuli",
      "malachite",
      "moonstone",
      "obsidian",
      "onyx",
      "opal",
      "pearl",
      "peridot",
      "quartz",
      "rose quartz",
      "ruby",
      "sapphire",
      "smoky quartz",
      "spinel",
      "sunstone",
      "topaz",
      "tourmaline",
      "turquoise",
      "zircon",
      "bloodstone",
      "star ruby",
      "star sapphire",
      "black opal",
      "fire opal",
      "ice quartz",
    ],

    hallmark: [
      "bearing a maker’s mark",
      "stamped with a guild seal",
      "signed on the inner band",
      "etched with tiny initials",
      "marked with a workshop rune",
    ],

    wear: [
      "with softened edges",
      "with hairline scratches",
      "with a well worn patina",
      "with a faint dent",
      "with polish marks",
      "with a tiny nick near the clasp",
    ],

    detail: [
      "set with a tiny gem",
      "with a hidden clasp",
      "balanced perfectly",
      "whispering faintly when moved",

      "with a snug clasp that clicks shut",
      "with an intricate hinge",
      "with a secret compartment",
      "with a locket that still opens",
      "with a delicate chain that tangles easily",
      "with a counterweight charm",
    ],

    provenance: [
      "from a noble’s wardrobe",
      "from a pawn broker’s tray",
      "from a temple donation",
      "from a traveling jeweler",
      "from a wedding coffer",
      "from an officer’s footlocker",
      "from a theater costume chest",
    ],

    rareDetail: [
      "set with a flawless stone that catches every torchglow",
      "crafted in a style associated with royal commissions",
      "in surprisingly perfect condition, as if unworn",
      "with filigree so fine it looks like lace",
      "that seems to quietly resist tarnish",
      "with a hidden inscription revealed only at an angle",
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

      "bloodstained",
      "smoke darkened",
      "salt crusted",
      "sun bleached",
      "mud caked",
      "cracked",
      "chipped",
      "tarnished",
      "blackened",
      "dented",
      "blessed",
      "anointed",
      "forbidden",
      "forgotten",
      "half melted",
    ],

    valueTier: {
      low: ["common", "rough", "crude", "plain", "worn", "makeshift"],
      mid: [
        "ritual",
        "well crafted",
        "carefully made",
        "old",
        "kept",
        "sturdy",
      ],
      high: [
        "priceless",
        "hallowed",
        "mastercrafted",
        "immaculate",
        "royal",
        "legendary",
      ],
    },

    noun: [
      "idol",
      "tablet",
      "censer",
      "chalice",
      "mask",
      "key",

      "reliquary",
      "prayer wheel",
      "ossuary token",
      "seal stamp",
      "bone flute",
      "ceremonial dagger",
      "ward stone",
      "saint’s coin",
      "crypt lantern",
      "ring of office",
      "funerary bell",
    ],

    material: [
      "bronze",
      "iron",
      "silver",
      "gold",
      "stone",
      "marble",
      "obsidian",
      "bone",
      "ivory",
      "glass",
      "black wood",
      "jade",
      "clay",
      "copper",
    ],

    era: [
      "first dynasty",
      "old kingdom",
      "high empire",
      "late imperial",
      "pre war",
      "restoration era",
      "forgotten age",
    ],

    origin: [
      "the basilica vaults",
      "a drowned shrine",
      "the old watchtower",
      "a moonlit crypt",
      "the northern barrows",
      "the glass desert",

      "a collapsed catacomb",
      "a sealed ossuary",
      "a battlefield chapel",
      "a razed monastery",
      "a sunken temple",
      "a burned archive",
      "a pilgrim road cairn",
      "a hidden reliquary niche",
      "a ruined bell tower",
      "a smuggler’s crate",
      "a noble family mausoleum",
    ],

    marking: [
      "marked with a warding sigil",
      "inscribed with prayer lines",
      "etched with tiny runes",
      "stamped with a temple seal",
      "scratched with tally marks",
      "carved with a crown motif",
      "bearing a saint’s icon",
      "scored with battle marks",
    ],

    condition: [
      "still dusted with pale ash",
      "cold even in sunlight",
      "wrapped in faded velvet",

      "sealed with old wax",
      "tied with brittle cord",
      "hinged but intact",
      "missing a small piece",
      "mended with crude solder",
      "slick with ancient oil",
      "smelling faintly of incense",
      "rattling softly when shaken",
    ],

    detail: [
      "still dusted with pale ash",
      "cold even in sunlight",
      "marked with a warding sigil",
      "wrapped in faded velvet",

      "warm near a flame",
      "heavier than it should be",
      "silent even when struck",
      "ringing faintly when moved",
      "leaving soot on the fingers",
      "with a hollow sound inside",
    ],

    provenance: [
      "kept in a priest’s strongbox",
      "taken from a siege cache",
      "salvaged from flood ruins",
      "passed down through a quiet order",
      "bartered for at a border shrine",
      "found behind a false wall",
      "recovered from a tomb offering pile",
    ],

    rareDetail: [
      "sealed so tightly it has never been opened",
      "bearing a name that has been deliberately scratched out",
      "with a surface that refuses to gather dust",
      "that seems to drink in torchlight",
      "with inscriptions that shift when viewed sideways",
      "listed in a brittle ledger as ‘never to be sold’",
      "that leaves the faint taste of metal in the mouth",
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
 * @param {{ category: ValuableCategoryKey }} args
 * @returns {{ name: string, description: string }}
 */
export function generateValuableName(args) {
  const bank = BANKS[args.category];

  if (!bank) {
    return {
      name: "curious trinket",
      description: "A small oddity with no clear origin.",
    };
  }

  // Category-specific assembly, so outputs feel distinct.
  switch (args.category) {
    case "gems": {
      const v = typeof value === "number" ? value : null;

      // Determine value tier (soft boundaries, tweak later)
      let valueAdj = "";
      if (v !== null) {
        if (v < 100) valueAdj = pick(bank.valueTier.low);
        else if (v < 1000) valueAdj = pick(bank.valueTier.mid);
        else valueAdj = pick(bank.valueTier.high);
      }

      // Core parts
      const size = chance(0.25) ? pick(bank.size) : "";
      const vibe = chance(0.5) ? pick(bank.vibe) : "";
      const color = chance(0.45) ? pick(bank.color) : "";
      const cut = chance(0.65) ? pick(bank.cut) : "";

      const material = pick(bank.material);
      const noun = pick(bank.noun);

      // FORMAT VARIANTS
      const formatRoll = crypto.randomInt(0, 100);

      let nameParts;
      if (formatRoll < 60) {
        // Standard: "Moonlit Emerald Cut Opal Crystal"
        nameParts = [size, vibe, valueAdj, color, cut, material, noun];
      } else if (formatRoll < 85) {
        // Material-first: "Opal Crystal, Star Cut"
        nameParts = [material, noun, cut];
      } else {
        // Cluster / fragment style
        nameParts = [vibe, material, noun];
      }

      const name = titleCase(joinNonEmpty(nameParts));

      // FEATURES
      let feature = pick(bank.feature);

      // Rare feature tier (≈ 6–8%)
      if (chance(0.07)) {
        feature = pick(bank.rareFeature);
      }

      const origin = chance(0.35) ? ` ${pick(bank.origin)}` : "";
      const description = sentenceCase(`${feature}${origin}`) + ".";

      return { name, description };
    }

    case "artObjects": {
      const v = typeof value === "number" ? value : null;

      // Value tier influences: higher value tends to include era/style and rarer notes.
      const includeEra =
        v === null ? chance(0.35) : v >= 1000 ? chance(0.75) : chance(0.45);
      const includeStyle =
        v === null ? chance(0.35) : v >= 1000 ? chance(0.7) : chance(0.45);

      const adjective = chance(0.75) ? pick(bank.adjective) : "";
      const era = includeEra && bank.era ? pick(bank.era) : "";
      const style = includeStyle && bank.style ? pick(bank.style) : "";
      const medium = pick(bank.medium);
      const subject = pick(bank.subject);

      // FORMAT VARIANTS
      const formatRoll = crypto.randomInt(0, 100);

      let nameParts;
      if (formatRoll < 55) {
        // Standard: "Haunting Oil Portrait of a Forgotten Duke"
        nameParts = [adjective, era, style, medium, "of", subject];
      } else if (formatRoll < 80) {
        // Medium-first: "Oil Portrait, Courtly, Late Imperial"
        nameParts = [medium, style ? `(${style})` : "", era ? `(${era})` : ""];
      } else {
        // Subject-first: "A Forgotten Duke, Rendered in Ink Study"
        nameParts = [
          subject,
          "rendered in",
          medium,
          adjective ? `(${adjective})` : "",
        ];
      }

      const name = titleCase(joinNonEmpty(nameParts));

      // DESCRIPTION: blend 1-2 common details + optional provenance
      const details = [];

      if (bank.detail?.length) details.push(pick(bank.detail));
      if (chance(0.45) && bank.condition?.length)
        details.push(pick(bank.condition));
      if (chance(0.35) && bank.provenance?.length)
        details.push(pick(bank.provenance));

      // Rare detail tier (more likely at higher value)
      const rareChance = v === null ? 0.06 : v >= 1000 ? 0.18 : 0.08;
      if (chance(rareChance) && bank.rareDetail?.length) {
        details.push(pick(bank.rareDetail));
      }

      const description =
        sentenceCase(details.filter(Boolean).join(", ")) + ".";

      return { name, description };
    }

    case "jewelry": {
      const v = typeof value === "number" ? value : null;

      let valueAdj = "";
      if (v !== null && bank.valueTier) {
        if (v < 100) valueAdj = pick(bank.valueTier.low);
        else if (v < 1000) valueAdj = pick(bank.valueTier.mid);
        else valueAdj = pick(bank.valueTier.high);
      }

      const adjective = chance(0.7) ? pick(bank.adjective) : "";
      const material = pick(bank.material);
      const noun = pick(bank.noun);
      const motif = chance(0.65) ? pick(bank.motif) : "";

      const includeStone = chance(v !== null && v >= 1000 ? 0.65 : 0.35);
      const stone = includeStone && bank.stone?.length ? pick(bank.stone) : "";

      const includeSetting =
        stone && chance(0.55) && bank.setting?.length ? pick(bank.setting) : "";
      const includeChain =
        chance(
          noun.includes("pendant") ||
            noun.includes("locket") ||
            noun.includes("medallion")
            ? 0.65
            : 0.25,
        ) && bank.chain?.length
          ? pick(bank.chain)
          : "";

      // FORMAT VARIANTS
      const formatRoll = crypto.randomInt(0, 100);
      let nameParts;

      if (formatRoll < 55) {
        // Standard: "Filigreed Masterworked Gold Locket With Crescent Moon"
        nameParts = [
          adjective,
          valueAdj,
          material,
          noun,
          motif ? "with" : "",
          motif,
        ];
      } else if (formatRoll < 80) {
        // Stone-forward: "Gold Ring Set With Sapphire"
        nameParts = [
          material,
          noun,
          stone ? "set with" : "",
          stone,
          motif ? "and" : "",
          motif,
        ];
      } else {
        // Motif-forward: "Twin Stars Brooch In Silver"
        nameParts = [
          motif,
          noun,
          "in",
          material,
          adjective ? `(${adjective})` : "",
        ];
      }

      const name = titleCase(joinNonEmpty(nameParts));

      // DESCRIPTION: 1-2 common + optional provenance + optional rare
      const details = [];

      if (stone) {
        const setPhrase = includeSetting
          ? `${includeSetting} ${stone}`
          : `set with ${stone}`;
        details.push(setPhrase);
      }

      if (chance(0.5) && bank.detail?.length) details.push(pick(bank.detail));
      if (chance(0.45) && bank.hallmark?.length)
        details.push(pick(bank.hallmark));
      if (chance(0.45) && bank.wear?.length) details.push(pick(bank.wear));
      if (includeChain) details.push(includeChain);
      if (chance(0.3) && bank.provenance?.length)
        details.push(pick(bank.provenance));

      const rareChance = v === null ? 0.06 : v >= 1000 ? 0.16 : 0.08;
      if (chance(rareChance) && bank.rareDetail?.length)
        details.push(pick(bank.rareDetail));

      const description =
        sentenceCase(details.filter(Boolean).join(", ")) + ".";

      return { name, description };
    }

    case "relics": {
      const v = typeof value === "number" ? value : null;

      let valueAdj = "";
      if (v !== null && bank.valueTier) {
        if (v < 100) valueAdj = pick(bank.valueTier.low);
        else if (v < 1000) valueAdj = pick(bank.valueTier.mid);
        else valueAdj = pick(bank.valueTier.high);
      }

      const adjective = chance(0.75) ? pick(bank.adjective) : "";
      const material =
        chance(0.55) && bank.material?.length ? pick(bank.material) : "";
      const era =
        chance(v !== null && v >= 1000 ? 0.5 : 0.25) && bank.era?.length
          ? pick(bank.era)
          : "";
      const noun = pick(bank.noun);
      const origin = pick(bank.origin);

      // FORMAT VARIANTS
      const formatRoll = crypto.randomInt(0, 100);

      let nameParts;
      if (formatRoll < 60) {
        // Standard: "Hallowed Sealed Obsidian Mask From A Moonlit Crypt"
        nameParts = [valueAdj, adjective, material, noun, "from", origin];
      } else if (formatRoll < 85) {
        // Noun-first: "Chalice of the Old Kingdom (Sanctified)"
        nameParts = [
          material,
          noun,
          era ? "of the" : "",
          era,
          adjective ? `(${adjective})` : "",
        ];
      } else {
        // Origin-first: "From the Northern Barrows: Ward Stone"
        nameParts = ["from", origin + ":", valueAdj, noun];
      }

      const name = titleCase(joinNonEmpty(nameParts));

      // DESCRIPTION: mix marking/condition + optional provenance + optional rare
      const bits = [];

      if (chance(0.5) && bank.marking?.length) bits.push(pick(bank.marking));
      if (chance(0.55) && bank.condition?.length)
        bits.push(pick(bank.condition));
      if (chance(0.4) && bank.detail?.length) bits.push(pick(bank.detail));
      if (chance(0.3) && bank.provenance?.length)
        bits.push(pick(bank.provenance));

      const rareChance = v === null ? 0.07 : v >= 1000 ? 0.18 : 0.09;
      if (chance(rareChance) && bank.rareDetail?.length)
        bits.push(pick(bank.rareDetail));

      const description = sentenceCase(bits.filter(Boolean).join(", ")) + ".";

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

/**
 * Return true with probability p (0..1).
 * @param {number} p
 * @returns {boolean}
 */
function chance(p) {
  const threshold = Math.max(0, Math.min(1, p));
  return crypto.randomInt(0, 1000) < Math.floor(threshold * 1000);
}
