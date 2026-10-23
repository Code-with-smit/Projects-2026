// Seeded LCG Random Generator
function createPRNG(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Convert HSL to HEX helper
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  let rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  let gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  let bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');
  return `#${rHex}${gHex}${bHex}`.toUpperCase();
}

// Name generator dictionaries
// Prime list sizes: 53, 47, 43
// Total combinations: 53 * 47 * 43 = 107,113 (guaranteed unique for indices 0 - 100,000)
const adjectives = [
  "Royal", "Imperial", "Midnight", "Arctic", "Urban", "Cosmic", "Solar", "Lunar", "Glacial", "Volcanic",
  "Celestial", "Ethereal", "Obsidian", "Golden", "Silver", "Bronze", "Platinum", "Copper", "Emerald", "Sapphire",
  "Ruby", "Amethyst", "Opal", "Amber", "Velvet", "Silk", "Satin", "Flannel", "Neon", "Digital",
  "Cyber", "Vintage", "Retro", "Modern", "Classic", "Minimal", "Vibrant", "Muted", "Shaded", "Glowing",
  "Radiant", "Fading", "Dusk", "Dawn", "Twilight", "Mystic", "Stellar", "Astral", "Nebula", "Shadow",
  "Alpine", "Tropical", "Desert"
];

const modifiers = [
  "Blue", "Red", "Green", "Yellow", "Purple", "Pink", "Orange", "Teal", "Cyan", "Magenta",
  "Lavender", "Mint", "Peach", "Plum", "Indigo", "Violet", "Rose", "Coral", "Olive", "Sage",
  "Burgundy", "Charcoal", "Slate", "Ash", "Ivory", "Cream", "Sand", "Clay", "Rust", "Oasis",
  "Aqua", "Crimson", "Scarlet", "Azure", "Cerulean", "Khaki", "Sepia", "Umber", "Ochre", "Lilac",
  "Orchid", "Turquoise", "Jade", "Graphite", "Cobalt", "Onyx", "Pearl"
];

const nouns = [
  "Ocean", "Forest", "Desert", "Mountain", "Sky", "Cloud", "Mist", "Fog", "Haze", "Smoke",
  "Dust", "Storm", "Rain", "Snow", "Ice", "Frost", "Glacier", "River", "Lake", "Sea",
  "Wave", "Tide", "Wind", "Breeze", "Glow", "Shine", "Glitter", "Spark", "Flame", "Fire",
  "Ashes", "Stone", "Rock", "Sand", "Dune", "Canyon", "Valley", "Meadow", "Field", "Garden",
  "Blossom", "Bloom", "Oasis"
];

const categories = [
  "Luxury", "Dark", "Light", "Minimal", "Corporate", "Finance", "Tech", "Cyberpunk", "Gaming", "Pastel",
  "Retro", "Editorial", "Nature", "Sunset", "Ocean", "Forest", "AI", "Startup", "Glassmorphism", "Gradient",
  "Neon", "Warm", "Cold", "Vintage", "Monochrome"
];

const moods = [
  "Elegant", "Energetic", "Calm", "Professional", "Creative", "Mysterious", "Warm", "Cool", "Bold", "Minimalist",
  "Sophisticated", "Vintage", "Futuristic", "Vibrant", "Balanced"
];

const premiumPalettes = [];

// Populate 100,000 premium palettes programmatically
(function generatePalettes() {
  const t0 = performance.now();
  for (let i = 0; i < 100000; i++) {
    // 1. Generate unique designer-like name using CRT coprime indices
    const adjIdx = i % adjectives.length;
    const modIdx = i % modifiers.length;
    const nounIdx = i % nouns.length;
    const name = `${adjectives[adjIdx]} ${modifiers[modIdx]} ${nouns[nounIdx]}`;

    // 2. Determine Category and Mood
    const category = categories[i % categories.length];
    const mood = moods[i % moods.length];

    // 3. Seed random generator for this palette ID
    const random = createPRNG(i + 1337);

    // Decide if 5 or 6 colors
    const colorCount = random() > 0.5 ? 6 : 5;
    const colors = [];

    // Helper to generate a random hue in range
    const randRange = (min, max) => Math.floor(random() * (max - min + 1)) + min;

    // 4. Generate colors based on category criteria (curated, balanced, designer-approved)
    const baseHue = randRange(0, 359);

    switch (category) {
      case "Luxury": {
        // Deep rich velvets/blacks, golds/rose-golds, and clean creams
        const isGoldAccent = random() > 0.3;
        const luxuryHue = isGoldAccent ? randRange(40, 48) : randRange(340, 355); // Gold or Champagne/Rose Gold
        colors.push(hslToHex(randRange(200, 240), randRange(10, 20), randRange(5, 8))); // Extremely dark body background
        colors.push(hslToHex(luxuryHue, randRange(15, 30), randRange(20, 30))); // Muted deep luxurious tone
        colors.push(hslToHex(randRange(30, 50), randRange(5, 12), randRange(88, 96))); // Premium Off-white/Cream
        colors.push(hslToHex(luxuryHue, randRange(50, 75), randRange(50, 62))); // Rich Accent Gold/Rose Gold
        colors.push(hslToHex(luxuryHue, randRange(30, 45), randRange(75, 84))); // Muted gold tint
        if (colorCount === 6) {
          colors.push(hslToHex((baseHue + 180) % 360, randRange(10, 20), randRange(40, 55))); // Contrast Platinum
        }
        break;
      }
      case "Dark": {
        // Dark backgrounds, deep blues/slates, single vibrant accent
        colors.push(hslToHex(baseHue, randRange(15, 25), randRange(6, 10)));
        colors.push(hslToHex(baseHue, randRange(10, 20), randRange(15, 25)));
        colors.push(hslToHex((baseHue + 30) % 360, randRange(15, 25), randRange(30, 45)));
        colors.push(hslToHex((baseHue + 180) % 360, randRange(70, 95), randRange(50, 65))); // Vibrant accent
        colors.push(hslToHex(baseHue, randRange(5, 15), randRange(85, 95))); // Soft light contrast
        if (colorCount === 6) {
          colors.push(hslToHex((baseHue + 210) % 360, randRange(50, 70), randRange(40, 50)));
        }
        break;
      }
      case "Light": {
        // High lightness off-whites, soft grays, and calm corporate tones
        colors.push(hslToHex(baseHue, randRange(5, 15), randRange(95, 98)));
        colors.push(hslToHex(baseHue, randRange(10, 20), randRange(85, 92)));
        colors.push(hslToHex((baseHue + 20) % 360, randRange(15, 30), randRange(70, 80)));
        colors.push(hslToHex(baseHue, randRange(50, 80), randRange(45, 55))); // Soft brand color
        colors.push(hslToHex((baseHue + 180) % 360, randRange(30, 50), randRange(30, 45))); // Dark text/contrast
        if (colorCount === 6) {
          colors.push(hslToHex(baseHue, randRange(20, 40), randRange(60, 70)));
        }
        break;
      }
      case "Minimal": {
        // Mostly monochrome, high contrast slate, warm gray, single quiet accent
        const minimalHue = random() > 0.5 ? 210 : 30; // Cool Slate or Warm Sand
        colors.push(hslToHex(minimalHue, randRange(5, 10), randRange(8, 12))); // Dark theme bg or light theme bg
        colors.push(hslToHex(minimalHue, randRange(3, 8), randRange(20, 25)));
        colors.push(hslToHex(minimalHue, randRange(2, 6), randRange(50, 60)));
        colors.push(hslToHex(minimalHue, randRange(5, 10), randRange(88, 94)));
        colors.push(hslToHex(baseHue, randRange(40, 65), randRange(45, 55))); // Subtle single colored accent
        if (colorCount === 6) {
          colors.push(hslToHex(minimalHue, randRange(2, 5), randRange(96, 99)));
        }
        break;
      }
      case "Corporate": {
        // Deep navy/indigo, slate blue, warm light gray, bright blue accent
        const corpHue = random() > 0.5 ? 220 : 200; // Blue or Teal
        colors.push(hslToHex(corpHue, randRange(40, 60), randRange(10, 16)));
        colors.push(hslToHex(corpHue, randRange(25, 45), randRange(25, 35)));
        colors.push(hslToHex(corpHue, randRange(10, 20), randRange(92, 97)));
        colors.push(hslToHex(corpHue, randRange(80, 100), randRange(50, 60))); // Tech brand blue
        colors.push(hslToHex((corpHue + 15) % 360, randRange(40, 60), randRange(40, 50)));
        if (colorCount === 6) {
          colors.push(hslToHex(28, randRange(75, 95), randRange(50, 60))); // Warm warning/orange accent
        }
        break;
      }
      case "Finance": {
        // Dark charcoal, forest green (growth), luxury gold, clean gray
        colors.push(hslToHex(210, randRange(15, 25), randRange(10, 14)));
        colors.push(hslToHex(140, randRange(40, 65), randRange(35, 45))); // Growth Green
        colors.push(hslToHex(45, randRange(50, 75), randRange(50, 60)));  // Wealth Gold
        colors.push(hslToHex(210, randRange(10, 15), randRange(88, 94)));
        colors.push(hslToHex(210, randRange(20, 30), randRange(20, 28)));
        if (colorCount === 6) {
          colors.push(hslToHex(0, randRange(65, 85), randRange(45, 55))); // Loss Red
        }
        break;
      }
      case "Tech": {
        // Deep purple-slate, digital indigo, high contrast neon blue, crisp white
        colors.push(hslToHex(240, randRange(25, 35), randRange(8, 12)));
        colors.push(hslToHex(250, randRange(45, 65), randRange(40, 50))); // Indigo Brand
        colors.push(hslToHex(190, randRange(80, 100), randRange(45, 55))); // Cyber blue accent
        colors.push(hslToHex(240, randRange(10, 20), randRange(92, 97)));
        colors.push(hslToHex(240, randRange(15, 25), randRange(20, 30)));
        if (colorCount === 6) {
          colors.push(hslToHex(150, randRange(70, 90), randRange(45, 55))); // Success Mint
        }
        break;
      }
      case "Cyberpunk": {
        // Deep violet backdrops, intense hot pink, neon blue, electric green
        colors.push(hslToHex(270, randRange(45, 60), randRange(4, 7)));
        colors.push(hslToHex(320, randRange(90, 100), randRange(50, 60))); // Neon Pink
        colors.push(hslToHex(180, randRange(90, 100), randRange(45, 55))); // Electric Cyan
        colors.push(hslToHex(280, randRange(80, 100), randRange(50, 62))); // Neon Violet
        colors.push(hslToHex(80, randRange(90, 100), randRange(45, 55)));  // Neon Lime
        if (colorCount === 6) {
          colors.push(hslToHex(35, randRange(95, 100), randRange(50, 60))); // Neon Orange
        }
        break;
      }
      case "Gaming": {
        // Heavy dark theme, hot crimson, acidic orange, electric purple
        colors.push(hslToHex(0, randRange(5, 10), randRange(6, 10)));
        colors.push(hslToHex(0, randRange(80, 100), randRange(45, 55))); // Hot Crimson Red
        colors.push(hslToHex(24, randRange(80, 100), randRange(48, 58))); // Acidic Orange
        colors.push(hslToHex(275, randRange(75, 95), randRange(50, 60))); // Rogue Purple
        colors.push(hslToHex(0, randRange(5, 15), randRange(85, 95)));
        if (colorCount === 6) {
          colors.push(hslToHex(200, randRange(80, 100), randRange(45, 55))); // Electric blue highlight
        }
        break;
      }
      case "Pastel": {
        // Delicate, soft, desaturated high-lightness hues
        colors.push(hslToHex(baseHue, randRange(25, 45), randRange(82, 90)));
        colors.push(hslToHex((baseHue + 60) % 360, randRange(25, 45), randRange(82, 90)));
        colors.push(hslToHex((baseHue + 120) % 360, randRange(25, 45), randRange(82, 90)));
        colors.push(hslToHex((baseHue + 180) % 360, randRange(25, 45), randRange(82, 90)));
        colors.push(hslToHex((baseHue + 240) % 360, randRange(25, 45), randRange(82, 90)));
        if (colorCount === 6) {
          colors.push(hslToHex((baseHue + 300) % 360, randRange(25, 45), randRange(82, 90)));
        }
        break;
      }
      case "Retro": {
        // Mustard yellow, warm orange, olive green, cream, vintage brown
        colors.push(hslToHex(35, randRange(15, 25), randRange(90, 95))); // Warm Cream
        colors.push(hslToHex(45, randRange(50, 70), randRange(45, 55))); // Mustard Yellow
        colors.push(hslToHex(22, randRange(60, 80), randRange(42, 52))); // Burnt Orange
        colors.push(hslToHex(85, randRange(30, 45), randRange(30, 40))); // Olive Green
        colors.push(hslToHex(18, randRange(30, 45), randRange(20, 30))); // Vintage Brown
        if (colorCount === 6) {
          colors.push(hslToHex(190, randRange(30, 45), randRange(40, 52))); // Teal Blue
        }
        break;
      }
      case "Editorial": {
        // Newspaper white, ink black, elegant crimson/burgundy, sage or ochre
        colors.push(hslToHex(40, randRange(5, 10), randRange(92, 96))); // Newspaper Warm White
        colors.push(hslToHex(0, randRange(5, 10), randRange(6, 10)));  // Ink Black
        colors.push(hslToHex(345, randRange(55, 75), randRange(25, 38))); // Elegant Burgundy
        colors.push(hslToHex(80, randRange(15, 25), randRange(45, 58)));  // Sage Gray
        colors.push(hslToHex(35, randRange(45, 60), randRange(40, 55)));  // Ochre Yellow
        if (colorCount === 6) {
          colors.push(hslToHex(210, randRange(15, 25), randRange(30, 45))); // Steel Blue
        }
        break;
      }
      case "Nature": {
        // Muted sage green, bark brown, sandy beige, leaf green, sky blue
        colors.push(hslToHex(90, randRange(25, 45), randRange(30, 42))); // Leaf Green
        colors.push(hslToHex(35, randRange(25, 35), randRange(85, 93))); // Sandy Beige
        colors.push(hslToHex(25, randRange(30, 45), randRange(25, 35))); // Bark Brown
        colors.push(hslToHex(200, randRange(40, 60), randRange(65, 78))); // Sky Blue
        colors.push(hslToHex(120, randRange(15, 25), randRange(50, 62))); // Sage Green
        if (colorCount === 6) {
          colors.push(hslToHex(48, randRange(50, 70), randRange(70, 82))); // Sun Yellow
        }
        break;
      }
      case "Sunset": {
        // Vibrant oranges, fiery reds, deep purples, magenta, gold
        colors.push(hslToHex(290, randRange(40, 60), randRange(10, 18))); // Deep Twilight Purple
        colors.push(hslToHex(330, randRange(75, 95), randRange(45, 58))); // Magenta
        colors.push(hslToHex(15, randRange(80, 100), randRange(50, 60))); // Fiery Orange
        colors.push(hslToHex(45, randRange(85, 100), randRange(55, 68))); // Golden Yellow
        colors.push(hslToHex(350, randRange(75, 95), randRange(40, 50))); // Sunset Red
        if (colorCount === 6) {
          colors.push(hslToHex(240, randRange(40, 60), randRange(25, 38))); // Midnight Blue Contrast
        }
        break;
      }
      case "Ocean": {
        // Deep navy, turquoise, aquamarine, seafoam, sandy beige
        colors.push(hslToHex(220, randRange(50, 70), randRange(8, 14))); // Deep Navy
        colors.push(hslToHex(195, randRange(75, 95), randRange(45, 55))); // Deep Turquoise
        colors.push(hslToHex(175, randRange(65, 85), randRange(55, 68))); // Aquamarine
        colors.push(hslToHex(155, randRange(55, 75), randRange(70, 82))); // Seafoam Green
        colors.push(hslToHex(35, randRange(25, 45), randRange(85, 92)));  // Sandy Beige
        if (colorCount === 6) {
          colors.push(hslToHex(205, randRange(45, 65), randRange(25, 35))); // Slate Ocean Blue
        }
        break;
      }
      case "Forest": {
        // Pine green, emerald, moss, bark brown, misty gray
        colors.push(hslToHex(145, randRange(45, 65), randRange(8, 14)));  // Dark Pine
        colors.push(hslToHex(130, randRange(40, 60), randRange(25, 35))); // Forest Moss
        colors.push(hslToHex(150, randRange(55, 75), randRange(40, 52))); // Emerald accent
        colors.push(hslToHex(28, randRange(25, 40), randRange(20, 30)));  // Bark Brown
        colors.push(hslToHex(145, randRange(10, 20), randRange(88, 94))); // Misty Sage Gray
        if (colorCount === 6) {
          colors.push(hslToHex(75, randRange(35, 55), randRange(48, 60)));  // Lichen Green
        }
        break;
      }
      case "AI": {
        // Cyber slate, electric violet, purple-pink gradient, glowing white
        colors.push(hslToHex(260, randRange(30, 45), randRange(6, 10)));
        colors.push(hslToHex(270, randRange(85, 100), randRange(50, 60))); // Electric Violet
        colors.push(hslToHex(315, randRange(80, 100), randRange(50, 60))); // Glowing Pink
        colors.push(hslToHex(190, randRange(90, 100), randRange(48, 58))); // Neural Cyan
        colors.push(hslToHex(260, randRange(10, 20), randRange(92, 97)));  // Clean light contrast
        if (colorCount === 6) {
          colors.push(hslToHex(260, randRange(25, 40), randRange(22, 32))); // Mid ground Slate
        }
        break;
      }
      case "Startup": {
        // Vibrant brand colors (violet/blue), trendy mint, off-white, slate gray
        colors.push(hslToHex(220, randRange(10, 20), randRange(8, 12)));
        colors.push(hslToHex(250, randRange(75, 95), randRange(52, 62))); // Violet Brand Accent
        colors.push(hslToHex(160, randRange(75, 95), randRange(45, 55))); // Mint Secondary Accent
        colors.push(hslToHex(220, randRange(10, 15), randRange(92, 97))); // Startup clean backdrop
        colors.push(hslToHex(220, randRange(15, 25), randRange(20, 30)));
        if (colorCount === 6) {
          colors.push(hslToHex(15, randRange(85, 100), randRange(52, 62))); // Startup warning/coral tone
        }
        break;
      }
      case "Glassmorphism": {
        // Translucent friendly glowing background hues, electric pink, deep navy
        colors.push(hslToHex(230, randRange(50, 70), randRange(5, 8))); // Deep glass container backdrop
        colors.push(hslToHex(280, randRange(85, 100), randRange(50, 62))); // Glowing purple
        colors.push(hslToHex(325, randRange(85, 100), randRange(52, 62))); // Glowing magenta
        colors.push(hslToHex(195, randRange(85, 100), randRange(48, 58))); // Glowing cyan
        colors.push(hslToHex(230, randRange(10, 20), randRange(90, 96))); // Clean glass white highlight
        if (colorCount === 6) {
          colors.push(hslToHex(230, randRange(30, 45), randRange(25, 38)));
        }
        break;
      }
      case "Gradient": {
        // Smoothly transition colors (sequential hues, matching saturation/lightness)
        const sVal = randRange(65, 85);
        const lVal = randRange(45, 60);
        colors.push(hslToHex(baseHue, sVal, lVal));
        colors.push(hslToHex((baseHue + 20) % 360, sVal, lVal));
        colors.push(hslToHex((baseHue + 40) % 360, sVal, lVal));
        colors.push(hslToHex((baseHue + 60) % 360, sVal, lVal));
        colors.push(hslToHex((baseHue + 80) % 360, sVal, lVal));
        if (colorCount === 6) {
          colors.push(hslToHex((baseHue + 100) % 360, sVal, lVal));
        }
        break;
      }
      case "Neon": {
        // Full intensity, maximum saturation colors with a black backdrop
        colors.push("#05050A");
        colors.push(hslToHex(baseHue, 100, 50));
        colors.push(hslToHex((baseHue + 120) % 360, 100, 50));
        colors.push(hslToHex((baseHue + 240) % 360, 100, 50));
        colors.push("#FFFFFF");
        if (colorCount === 6) {
          colors.push(hslToHex((baseHue + 60) % 360, 100, 50));
        }
        break;
      }
      case "Warm": {
        // Reds, oranges, yellows, peaches, warm beige
        colors.push(hslToHex(randRange(10, 45), randRange(60, 85), randRange(15, 25))); // Warm deep base
        colors.push(hslToHex(0, randRange(75, 95), randRange(45, 55)));   // Warm Red
        colors.push(hslToHex(25, randRange(80, 100), randRange(50, 60)));  // Warm Orange
        colors.push(hslToHex(48, randRange(75, 95), randRange(55, 68)));  // Warm Yellow
        colors.push(hslToHex(32, randRange(25, 45), randRange(85, 94)));  // Peach Beige
        if (colorCount === 6) {
          colors.push(hslToHex(350, randRange(65, 85), randRange(35, 45))); // Deep Rose
        }
        break;
      }
      case "Cold": {
        // Blues, teals, ice blue, deep purple, cool grays
        colors.push(hslToHex(220, randRange(20, 35), randRange(8, 14)));  // Deep cold base
        colors.push(hslToHex(200, randRange(60, 80), randRange(45, 55))); // Ice Blue
        colors.push(hslToHex(230, randRange(50, 70), randRange(40, 50))); // Cool Indigo
        colors.push(hslToHex(180, randRange(45, 65), randRange(60, 72))); // Mint Ice
        colors.push(hslToHex(210, randRange(10, 20), randRange(88, 94))); // Cool light gray
        if (colorCount === 6) {
          colors.push(hslToHex(260, randRange(40, 60), randRange(30, 42))); // Cold Violet
        }
        break;
      }
      case "Vintage": {
        // Desaturated sepia, dusty rose, sage green, mustard, muted indigo
        colors.push(hslToHex(35, randRange(15, 25), randRange(88, 94)));  // Vintage Paper
        colors.push(hslToHex(345, randRange(30, 45), randRange(40, 52))); // Dusty Rose
        colors.push(hslToHex(95, randRange(20, 35), randRange(35, 48)));  // Muted Sage
        colors.push(hslToHex(45, randRange(40, 55), randRange(45, 58)));  // Muted Mustard
        colors.push(hslToHex(210, randRange(25, 40), randRange(30, 42))); // Muted Indigo
        if (colorCount === 6) {
          colors.push(hslToHex(18, randRange(35, 50), randRange(30, 42)));  // Burnt Sienna
        }
        break;
      }
      case "Monochrome": {
        // Shades and tints of a single hue
        const monoHue = baseHue;
        const sVal = randRange(40, 65);
        colors.push(hslToHex(monoHue, sVal, 10));
        colors.push(hslToHex(monoHue, sVal, 25));
        colors.push(hslToHex(monoHue, sVal, 45));
        colors.push(hslToHex(monoHue, sVal, 65));
        colors.push(hslToHex(monoHue, sVal, 88));
        if (colorCount === 6) {
          colors.push(hslToHex(monoHue, sVal, 96));
        }
        break;
      }
      default: {
        // Fallback standard balanced harmonic
        colors.push(hslToHex(baseHue, 20, 10));
        colors.push(hslToHex((baseHue + 30) % 360, 40, 30));
        colors.push(hslToHex((baseHue + 60) % 360, 60, 50));
        colors.push(hslToHex((baseHue + 180) % 360, 50, 70));
        colors.push(hslToHex(baseHue, 10, 92));
        if (colorCount === 6) {
          colors.push(hslToHex((baseHue + 210) % 360, 30, 80));
        }
        break;
      }
    }

    // Append to palettes DB
    premiumPalettes.push({
      id: i + 1,
      name: name,
      category: category,
      mood: mood,
      colors: colors
    });
  }
  const t1 = performance.now();
  console.log(`Successfully generated ${premiumPalettes.length} palettes in ${(t1 - t0).toFixed(2)}ms.`);
})();

// Export globally for browser environment
window.premiumPalettes = premiumPalettes;
window.paletteCategories = categories;
window.paletteMoods = moods;
