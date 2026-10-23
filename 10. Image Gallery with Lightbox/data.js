/**
 * Photography Gallery Dataset
 * High-resolution curated editorial imagery with comprehensive metadata
 */

const galleryData = [
  // --- NATURE ---
  {
    id: "nat-01",
    title: "Whispers of the Misty Pines",
    category: "nature",
    categoryLabel: "Nature",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    aspect: "tall",
    aspectRatio: "3/4",
    description: "Dense mountain fog silently rolling across the primordial fir tree ridges in the Pacific Northwest at dawn.",
    photographer: "Kilian Schonberger",
    photographerHandle: "@kilianschonberger",
    location: "Black Forest, Germany",
    date: "2024-04-12",
    camera: "Sony A7R V • FE 70-200mm f/2.8 GM II",
    exif: {
      aperture: "f/8.0",
      shutter: "1/40s",
      iso: "100",
      focalLength: "135mm"
    },
    color: "#18201a"
  },
  {
    id: "nat-02",
    title: "Emerald Reflection at Alpine Dawn",
    category: "nature",
    categoryLabel: "Nature",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    aspect: "wide",
    aspectRatio: "16/9",
    description: "Glassy glacial waters mirroring towering granite peaks illuminated by the first amber glow of morning light.",
    photographer: "Bailey Zindel",
    photographerHandle: "@baileyzindel",
    location: "Yosemite National Park, California",
    date: "2024-05-18",
    camera: "Canon EOS R5 • RF 15-35mm f/2.8L IS",
    exif: {
      aperture: "f/11",
      shutter: "1/15s",
      iso: "64",
      focalLength: "21mm"
    },
    color: "#1e2a2c"
  },
  {
    id: "nat-03",
    title: "Golden Hour Mountain Ridgeline",
    category: "nature",
    categoryLabel: "Nature",
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
    aspect: "square",
    aspectRatio: "1/1",
    description: "Warm radiant sunlight cresting jagged alpine ridges with dramatic god rays slicing through atmospheric haze.",
    photographer: "David Marcu",
    photographerHandle: "@davidmarcu",
    location: "Dolomites, Northern Italy",
    date: "2024-02-28",
    camera: "Nikon Z8 • NIKKOR Z 24-70mm f/2.8 S",
    exif: {
      aperture: "f/5.6",
      shutter: "1/250s",
      iso: "200",
      focalLength: "50mm"
    },
    color: "#28231c"
  },
  {
    id: "nat-04",
    title: "Canopy of the Ancient Redwood Grove",
    category: "nature",
    categoryLabel: "Nature",
    url: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80",
    aspect: "tall",
    aspectRatio: "3/4",
    description: "Looking straight up into the towering cathedral of thousand-year-old giants bathed in cool coastal twilight.",
    photographer: "Casey Horner",
    photographerHandle: "@mischievous_penguins",
    location: "Redwood National Park, California",
    date: "2023-11-14",
    camera: "Fujifilm GFX 100 II • GF 23mm f/4 R LM WR",
    exif: {
      aperture: "f/8.0",
      shutter: "1/8s",
      iso: "400",
      focalLength: "18mm"
    },
    color: "#16201b"
  },
  {
    id: "nat-05",
    title: "Mirror of Solitude at Twilight",
    category: "nature",
    categoryLabel: "Nature",
    url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80",
    aspect: "wide",
    aspectRatio: "16/9",
    description: "Crystalline lake reflecting violet dusk clouds as mountain silhouettes settle into evening silence.",
    photographer: "Luca Bravo",
    photographerHandle: "@lucabravo",
    location: "Lake Braies, South Tyrol",
    date: "2023-09-05",
    camera: "Hasselblad X2D 100C • XCD 38mm f/2.5 V",
    exif: {
      aperture: "f/4.0",
      shutter: "1/60s",
      iso: "100",
      focalLength: "38mm"
    },
    color: "#1b2126"
  },

  // --- ARCHITECTURE ---
  {
    id: "arc-01",
    title: "Monolithic Geometry in Glass & Steel",
    category: "architecture",
    categoryLabel: "Architecture",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    aspect: "tall",
    aspectRatio: "3/4",
    description: "Ascending vertical perspectives of contemporary corporate architecture slicing into the clear morning sky.",
    photographer: "Simone Hutsch",
    photographerHandle: "@heysupersimi",
    location: "Frankfurt am Main, Germany",
    date: "2024-03-22",
    camera: "Sony A7R IV • FE 16-35mm f/2.8 GM",
    exif: {
      aperture: "f/9.0",
      shutter: "1/320s",
      iso: "100",
      focalLength: "16mm"
    },
    color: "#161b24"
  },
  {
    id: "arc-02",
    title: "The Fibonacci Vortex",
    category: "architecture",
    categoryLabel: "Architecture",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    aspect: "square",
    aspectRatio: "1/1",
    description: "An infinite spiral staircase exhibiting immaculate mathematical symmetry, warm ambient plaster, and dramatic shadows.",
    photographer: "Sam Moqadam",
    photographerHandle: "@sam_moqadam",
    location: "Vatican Museums, Rome",
    date: "2024-01-19",
    camera: "Leica SL2 • Vario-Elmarit-SL 24-70mm f/2.8 ASPH",
    exif: {
      aperture: "f/4.5",
      shutter: "1/125s",
      iso: "320",
      focalLength: "28mm"
    },
    color: "#25211c"
  },
  {
    id: "arc-03",
    title: "Symphony of Gothic Arches",
    category: "architecture",
    categoryLabel: "Architecture",
    url: "https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=800&q=80",
    aspect: "wide",
    aspectRatio: "16/9",
    description: "Soaring rib vaults and stone columns demonstrating medieval structural genius with soft streaming window light.",
    photographer: "Eberhard Grossgasteiger",
    photographerHandle: "@eberhardgross",
    location: "Seville Cathedral, Spain",
    date: "2023-12-08",
    camera: "Canon EOS R6 Mark II • RF 24-105mm f/4L IS",
    exif: {
      aperture: "f/6.3",
      shutter: "1/50s",
      iso: "800",
      focalLength: "35mm"
    },
    color: "#221e1a"
  },
  {
    id: "arc-04",
    title: "Parametric Pavilion in White",
    category: "architecture",
    categoryLabel: "Architecture",
    url: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=800&q=80",
    aspect: "tall",
    aspectRatio: "3/4",
    description: "Futuristic organic curved concrete envelopes creating a dramatic dance of soft shadows and ambient light.",
    photographer: "Dan Freeman",
    photographerHandle: "@danfreemanphoto",
    location: "Valencia Arts Complex, Spain",
    date: "2023-10-30",
    camera: "Sony A1 • FE 24-70mm f/2.8 GM II",
    exif: {
      aperture: "f/7.1",
      shutter: "1/500s",
      iso: "100",
      focalLength: "45mm"
    },
    color: "#1e2126"
  },
  {
    id: "arc-05",
    title: "Minimalist Concrete & Shadow",
    category: "architecture",
    categoryLabel: "Architecture",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    aspect: "wide",
    aspectRatio: "16/9",
    description: "Brutalist simplicity paired with warm interior illumination and razor-sharp geometric glass lines.",
    photographer: "Alexandre Chambon",
    photographerHandle: "@alexandre_chambon",
    location: "Copenhagen, Denmark",
    date: "2024-04-02",
    camera: "Fujifilm X-T5 • XF 16-55mm f/2.8 R LM WR",
    exif: {
      aperture: "f/5.6",
      shutter: "1/160s",
      iso: "160",
      focalLength: "23mm"
    },
    color: "#181a1e"
  },

  // --- PORTRAITS ---
  {
    id: "por-01",
    title: "The Golden Reverie",
    category: "portraits",
    categoryLabel: "Portraits",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    aspect: "tall",
    aspectRatio: "3/4",
    description: "A spontaneous, luminous portrait capturing authentic warmth and radiant natural evening glow.",
    photographer: "Michael Dam",
    photographerHandle: "@michaeldam",
    location: "Los Angeles, California",
    date: "2024-05-10",
    camera: "Canon EOS R5 • RF 85mm f/1.2L USM",
    exif: {
      aperture: "f/1.4",
      shutter: "1/800s",
      iso: "100",
      focalLength: "85mm"
    },
    color: "#281e1a"
  },
  {
    id: "por-02",
    title: "Contemplation in Chiaroscuro",
    category: "portraits",
    categoryLabel: "Portraits",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    aspect: "square",
    aspectRatio: "1/1",
    description: "Subtle side lighting carving deep cinematic contour and authentic emotion in a minimalist studio environment.",
    photographer: "Joseph Gonzalez",
    photographerHandle: "@miracletwentyone",
    location: "New York Studio, NY",
    date: "2024-03-01",
    camera: "Sony A7 IV • FE 50mm f/1.2 GM",
    exif: {
      aperture: "f/2.0",
      shutter: "1/200s",
      iso: "125",
      focalLength: "50mm"
    },
    color: "#1e1b19"
  },
  {
    id: "por-03",
    title: "Vogue Elegance & Emerald Accents",
    category: "portraits",
    categoryLabel: "Portraits",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    aspect: "tall",
    aspectRatio: "3/4",
    description: "High-fashion editorial portrait highlighting sharp bone structure, deep gaze, and modern haute couture styling.",
    photographer: "Aiony Haust",
    photographerHandle: "@aiony",
    location: "Paris Fashion Week, France",
    date: "2024-02-14",
    camera: "Nikon Z9 • NIKKOR Z 85mm f/1.2 S",
    exif: {
      aperture: "f/1.8",
      shutter: "1/640s",
      iso: "64",
      focalLength: "85mm"
    },
    color: "#241f22"
  },
  {
    id: "por-04",
    title: "Soulful Gaze in the Rain",
    category: "portraits",
    categoryLabel: "Portraits",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    aspect: "tall",
    aspectRatio: "3/4",
    description: "An evocative close-up framing piercing eyes reflecting rainy streetlights in the dark.",
    photographer: "Jurica Koletic",
    photographerHandle: "@juricakoletic",
    location: "Zagreb, Croatia",
    date: "2023-11-20",
    camera: "Sony A7R III • FE 85mm f/1.4 GM",
    exif: {
      aperture: "f/1.6",
      shutter: "1/160s",
      iso: "400",
      focalLength: "85mm"
    },
    color: "#191c20"
  },
  {
    id: "por-05",
    title: "Youth in Golden Meadows",
    category: "portraits",
    categoryLabel: "Portraits",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    aspect: "wide",
    aspectRatio: "16/9",
    description: "Warm summer breeze carrying hair across sun-drenched golden fields in timeless 35mm film aesthetic.",
    photographer: "Valerie Elash",
    photographerHandle: "@valerieelash",
    location: "Provence, France",
    date: "2023-08-18",
    camera: "Leica M11 • Summilux-M 50mm f/1.4 ASPH",
    exif: {
      aperture: "f/2.0",
      shutter: "1/1200s",
      iso: "100",
      focalLength: "50mm"
    },
    color: "#2a221b"
  },

  // --- TRAVEL ---
  {
    id: "trv-01",
    title: "Celestial Ascent over Cappadocia",
    category: "travel",
    categoryLabel: "Travel",
    url: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=800&q=80",
    aspect: "tall",
    aspectRatio: "3/4",
    description: "Dozens of vibrant hot air balloons quietly drifting over prehistoric volcanic fairy chimneys during sunrise.",
    photographer: "Yonatan Borzov",
    photographerHandle: "@yonatancbs",
    location: "Göreme, Cappadocia, Turkey",
    date: "2024-04-18",
    camera: "Sony A7 IV • FE 24-105mm f/4 G OSS",
    exif: {
      aperture: "f/6.3",
      shutter: "1/400s",
      iso: "200",
      focalLength: "35mm"
    },
    color: "#2b211d"
  },
  {
    id: "trv-02",
    title: "The Turquoise Sanctuary of Como",
    category: "travel",
    categoryLabel: "Travel",
    url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
    aspect: "wide",
    aspectRatio: "16/9",
    description: "A traditional wooden rowboat gently bobbing in crystal alpine water with towering snow-dusted summits behind.",
    photographer: "Kalai Venthan",
    photographerHandle: "@venthan",
    location: "Lake Como, Lombardy, Italy",
    date: "2024-03-12",
    camera: "Fujifilm X-T4 • XF 18-55mm f/2.8-4 R LM OIS",
    exif: {
      aperture: "f/5.0",
      shutter: "1/500s",
      iso: "160",
      focalLength: "28mm"
    },
    color: "#182326"
  },
  {
    id: "trv-03",
    title: "Pastel Cliffs of Positano",
    category: "travel",
    categoryLabel: "Travel",
    url: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80",
    aspect: "tall",
    aspectRatio: "3/4",
    description: "Centuries-old terracotta and lemon-hued villas cascading down vertical cliffs directly into the Tyrrhenian Sea.",
    photographer: "Reece Parker",
    photographerHandle: "@reece_parker",
    location: "Amalfi Coast, Italy",
    date: "2023-10-15",
    camera: "Canon EOS R • RF 24-70mm f/2.8L USM",
    exif: {
      aperture: "f/7.1",
      shutter: "1/250s",
      iso: "100",
      focalLength: "40mm"
    },
    color: "#28201a"
  },
  {
    id: "trv-04",
    title: "Twilight in the Ancient Torii Gate",
    category: "travel",
    categoryLabel: "Travel",
    url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    aspect: "square",
    aspectRatio: "1/1",
    description: "Vivid vermillion torii gates winding through tranquil cedar woods during a meditative dusk shower.",
    photographer: "Su San Lee",
    photographerHandle: "@susan_lee",
    location: "Fushimi Inari-taisha, Kyoto, Japan",
    date: "2023-11-04",
    camera: "Sony A7S III • FE 35mm f/1.4 GM",
    exif: {
      aperture: "f/2.2",
      shutter: "1/100s",
      iso: "800",
      focalLength: "35mm"
    },
    color: "#2c1c18"
  },
  {
    id: "trv-05",
    title: "Pristine Atoll in French Polynesia",
    category: "travel",
    categoryLabel: "Travel",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    aspect: "wide",
    aspectRatio: "16/9",
    description: "Soft white sand blending into gradients of electric aquamarine and deep sapphire under tropical trade winds.",
    photographer: "Sean Oulashin",
    photographerHandle: "@oulashin",
    location: "Bora Bora, French Polynesia",
    date: "2023-07-22",
    camera: "DJI Mavic 3 Pro • Hasselblad 24mm f/2.8",
    exif: {
      aperture: "f/4.0",
      shutter: "1/1000s",
      iso: "100",
      focalLength: "24mm"
    },
    color: "#15262a"
  },

  // --- STREET PHOTOGRAPHY ---
  {
    id: "str-01",
    title: "Neon Reflections of Shinjuku",
    category: "street",
    categoryLabel: "Street Photography",
    url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80",
    aspect: "tall",
    aspectRatio: "3/4",
    description: "Cyberpunk rain-slicked pavement capturing the kaleidoscope of Japanese typography and glowing lanterns.",
    photographer: "Alex Knight",
    photographerHandle: "@agk42",
    location: "Tokyo, Japan",
    date: "2024-05-02",
    camera: "Sony A7R III • FE 28mm f/2",
    exif: {
      aperture: "f/2.0",
      shutter: "1/80s",
      iso: "1600",
      focalLength: "28mm"
    },
    color: "#21152a"
  },
  {
    id: "str-02",
    title: "The Urban Canyon at Rush Hour",
    category: "street",
    categoryLabel: "Street Photography",
    url: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80",
    aspect: "wide",
    aspectRatio: "16/9",
    description: "Long exposure light trails weaving between towering steel monoliths in the heart of downtown Chicago.",
    photographer: "Sawyer Bengtson",
    photographerHandle: "@sawyerbengtson",
    location: "Chicago, Illinois",
    date: "2024-03-30",
    camera: "Nikon Z7 II • NIKKOR Z 14-30mm f/4 S",
    exif: {
      aperture: "f/13",
      shutter: "8.0s",
      iso: "64",
      focalLength: "20mm"
    },
    color: "#251d18"
  },
  {
    id: "str-03",
    title: "Umbrella in the Cyberpunk Rain",
    category: "street",
    categoryLabel: "Street Photography",
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    aspect: "square",
    aspectRatio: "1/1",
    description: "A lone pedestrian silhouette beneath a translucent umbrella backlit by intense halogen car headlights.",
    photographer: "Aleksandar Pasaric",
    photographerHandle: "@apasaric",
    location: "Seoul, South Korea",
    date: "2024-01-05",
    camera: "Fujifilm X-Pro3 • XF 35mm f/1.4 R",
    exif: {
      aperture: "f/1.4",
      shutter: "1/125s",
      iso: "1250",
      focalLength: "35mm"
    },
    color: "#181a24"
  },
  {
    id: "str-04",
    title: "Chinatown Lanterns in the Mist",
    category: "street",
    categoryLabel: "Street Photography",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80",
    aspect: "tall",
    aspectRatio: "3/4",
    description: "Crimson lanterns glowing through humid evening air as street merchants pack away handcarts.",
    photographer: "Florian Wehde",
    photographerHandle: "@florianwehde",
    location: "Hong Kong Island",
    date: "2023-12-19",
    camera: "Leica Q2 • Summilux 28mm f/1.7 ASPH",
    exif: {
      aperture: "f/1.7",
      shutter: "1/90s",
      iso: "640",
      focalLength: "28mm"
    },
    color: "#28181a"
  },
  {
    id: "str-05",
    title: "The Solitary Commuter on Platform 4",
    category: "street",
    categoryLabel: "Street Photography",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    aspect: "wide",
    aspectRatio: "16/9",
    description: "Moody vintage tones framing a passenger lost in thought beneath overhead station clocks.",
    photographer: "Craig Whitehead",
    photographerHandle: "@sixstreetunder",
    location: "London King's Cross, UK",
    date: "2023-09-14",
    camera: "Fujifilm X100V • 23mm f/2.0",
    exif: {
      aperture: "f/2.8",
      shutter: "1/200s",
      iso: "800",
      focalLength: "23mm"
    },
    color: "#201c18"
  },

  // --- ABSTRACT ---
  {
    id: "abs-01",
    title: "Prismatic Waveform Dynamics",
    category: "abstract",
    categoryLabel: "Abstract",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
    aspect: "tall",
    aspectRatio: "3/4",
    description: "Macrophotography of viscous acrylic pigments swirling in dynamic tension, forming hypnotic fluid patterns.",
    photographer: "Geordanna Cordero",
    photographerHandle: "@geordannacordero",
    location: "Creative Fluid Lab, Vancouver",
    date: "2024-04-26",
    camera: "Canon 1D X Mark III • MP-E 65mm f/2.8 1-5x Macro",
    exif: {
      aperture: "f/11",
      shutter: "1/250s",
      iso: "200",
      focalLength: "65mm"
    },
    color: "#2a1820"
  },
  {
    id: "abs-02",
    title: "Chromium Liquid Ribbon",
    category: "abstract",
    categoryLabel: "Abstract",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
    aspect: "wide",
    aspectRatio: "16/9",
    description: "Iridescent metallic reflections bending along fluid curves like molten chrome suspended in zero gravity.",
    photographer: "Milad Fakurian",
    photographerHandle: "@fakurian",
    location: "Studio Zero, London",
    date: "2024-03-05",
    camera: "Hasselblad H6D-100c • HC 120mm f/4 Macro",
    exif: {
      aperture: "f/16",
      shutter: "1/125s",
      iso: "100",
      focalLength: "120mm"
    },
    color: "#18222c"
  },
  {
    id: "abs-03",
    title: "Ethereal Smoke Sculpture",
    category: "abstract",
    categoryLabel: "Abstract",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    aspect: "square",
    aspectRatio: "1/1",
    description: "Suspended incense smoke illuminated by micro-strobes, crystallizing into delicate gossamer veils against void black.",
    photographer: "Steve Johnson",
    photographerHandle: "@steve_j",
    location: "Studio Minimal, Portland",
    date: "2024-01-28",
    camera: "Sony A7R V • FE 90mm f/2.8 Macro G OSS",
    exif: {
      aperture: "f/8.0",
      shutter: "1/1600s",
      iso: "400",
      focalLength: "90mm"
    },
    color: "#211a26"
  },
  {
    id: "abs-04",
    title: "Neural Circuitry in Neon Blue",
    category: "abstract",
    categoryLabel: "Abstract",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    aspect: "tall",
    aspectRatio: "3/4",
    description: "Microscopic silicon wafer pathways transmitting pulsed photon data in bioluminescent cyan and indigo hues.",
    photographer: "Ummano",
    photographerHandle: "@ummano",
    location: "Silicon Valley Cleanroom, California",
    date: "2023-11-12",
    camera: "Olympus OM-D E-M1 Mark III • M.Zuiko 60mm f/2.8 Macro",
    exif: {
      aperture: "f/5.6",
      shutter: "1/60s",
      iso: "200",
      focalLength: "60mm"
    },
    color: "#121e2c"
  },
  {
    id: "abs-05",
    title: "Topography of Sand & Shadow",
    category: "abstract",
    categoryLabel: "Abstract",
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1920&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
    aspect: "wide",
    aspectRatio: "16/9",
    description: "Aerial low-sun angle casting pitch-black razor shadows across sinusoidal desert sand dune crests.",
    photographer: "Patrick Hendry",
    photographerHandle: "@worldsbetweenlines",
    location: "Sossusvlei, Namib Desert",
    date: "2023-08-30",
    camera: "Phase One IQ4 150MP • Schneider Kreuznach 80mm",
    exif: {
      aperture: "f/11",
      shutter: "1/400s",
      iso: "50",
      focalLength: "80mm"
    },
    color: "#2c2117"
  }
];

// Helper fallback SVG image generator for offline or network-blocked environments
function generateFallbackSvg(title, category) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#14171f"/>
        <stop offset="50%" stop-color="#1c202a"/>
        <stop offset="100%" stop-color="#0e1015"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <circle cx="400" cy="260" r="70" fill="none" stroke="#e5a962" stroke-width="3" opacity="0.4"/>
    <circle cx="400" cy="260" r="45" fill="none" stroke="#e5a962" stroke-width="2" opacity="0.6"/>
    <circle cx="400" cy="260" r="16" fill="#e5a962" opacity="0.8"/>
    <text x="400" y="380" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="22" font-weight="600" fill="#f5f6f8" text-anchor="middle" letter-spacing="1">${title}</text>
    <text x="400" y="415" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="500" fill="#9da3af" text-anchor="middle" letter-spacing="2" text-transform="uppercase">${category} • ARCHIVAL PHOTO</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
