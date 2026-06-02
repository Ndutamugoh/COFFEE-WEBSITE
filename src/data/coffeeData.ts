import { Product, Category, RoastLevel, GrindType } from "../types";

export const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-signature-aa",
    name: "Mugi Pure Arabic Kenyan Coffee (Kenya AA)",
    slug: "mugi-pure-arabic-kenya-aa",
    category: Category.WHOLE_BEAN,
    origin: "Mt. Kenya Highlands",
    altitude: "2020 MASL",
    process: "Washed / Wet Processed",
    roastLevel: RoastLevel.MEDIUM,
    tastingNotes: ["Citrus", "Blackcurrant", "Dark Chocolate"],
    brewingGuide: "Milled and hand-sorted from the rich soils of Mt. Kenya Highlands. For optimal flavor representation, brew at a 1:16 coffee-to-water ratio. Perfect for French Press, Espresso, and manual dripper pour-overs (V60). For instant roasted quality feel free to reach out to our team at +254 791 291 281 or +254 728 372 031.",
    bestFor: ["French Press", "Espresso", "V60"],
    isFeatured: true,
    isActive: true,
    images: [
      "/src/assets/images/mugi_coffee_bag_mockup_1780392995850.png",
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=600&auto=format&fit=crop"
    ],
    description: "The gold-standard high-altitude reserve micro-lot from the fertile slopes of Mt. Kenya. Freshly drum-roasted in small batches, wet-processed to release sweet vibrant citrus, blackcurrant, and sophisticated dark chocolate notes. Pure raw wisdom served directly to your desk.",
    variants: [
      { id: "var-aa-wb-250", productId: "prod-signature-aa", grindType: GrindType.WHOLE_BEAN, weightGrams: 250, weightLabel: "250g bag", priceKes: 750, stockQty: 48, sku: "MUGI-AA-WB-250" },
      { id: "var-aa-wb-500", productId: "prod-signature-aa", grindType: GrindType.WHOLE_BEAN, weightGrams: 500, weightLabel: "500g bag", priceKes: 1400, stockQty: 32, sku: "MUGI-AA-WB-500" },
      { id: "var-aa-wb-1000", productId: "prod-signature-aa", grindType: GrindType.WHOLE_BEAN, weightGrams: 1000, weightLabel: "1kg bag", priceKes: 2600, stockQty: 15, sku: "MUGI-AA-WB-1000" },
      { id: "var-aa-coarse-250", productId: "prod-signature-aa", grindType: GrindType.COARSE, weightGrams: 250, weightLabel: "250g bag (Coarse)", priceKes: 750, stockQty: 25, sku: "MUGI-AA-CP-250" },
      { id: "var-aa-medium-250", productId: "prod-signature-aa", grindType: GrindType.MEDIUM, weightGrams: 250, weightLabel: "250g bag (Medium)", priceKes: 750, stockQty: 30, sku: "MUGI-AA-MG-250" },
      { id: "var-aa-espresso-250", productId: "prod-signature-aa", grindType: GrindType.ESPRESSO, weightGrams: 250, weightLabel: "250g bag (Espresso)", priceKes: 750, stockQty: 18, sku: "MUGI-AA-EP-250" }
    ]
  },
  {
    id: "prod-peaberry",
    name: "Mugi Peaberry Reserve",
    slug: "mugi-peaberry-reserve",
    category: Category.WHOLE_BEAN,
    origin: "Nyeri County, Central Kenya",
    altitude: "1950 MASL",
    process: "Double Washed",
    roastLevel: RoastLevel.LIGHT,
    tastingNotes: ["Jasmine Florals", "Lemon Zest", "Honey Sweetness"],
    brewingGuide: "Stellar as filter brew, AeroPress or V60 with light water extraction. Highlights the delicate jasmine florals and honey undertones. Target water temperature: 90°C.",
    bestFor: ["V60", "AeroPress", "Chemex"],
    isFeatured: true,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop"],
    description: "Highly sought-after, hand-sorted Peaberry beans. Because the flower yields only a single round seed per cherry rather than two flat beans, flavor is concentrated into an intensely sweet, bright, and floral cup reminiscent of lemon zest and mountain wildflowers.",
    variants: [
      { id: "var-pb-wb-250", productId: "prod-peaberry", grindType: GrindType.WHOLE_BEAN, weightGrams: 250, weightLabel: "250g bag", priceKes: 900, stockQty: 12, sku: "MUGI-PB-WB-250" },
      { id: "var-pb-wb-500", productId: "prod-peaberry", grindType: GrindType.WHOLE_BEAN, weightGrams: 500, weightLabel: "500g bag", priceKes: 1700, stockQty: 8, sku: "MUGI-PB-WB-500" },
      { id: "var-pb-med-250", productId: "prod-peaberry", grindType: GrindType.MEDIUM, weightGrams: 250, weightLabel: "250g bag (Medium)", priceKes: 900, stockQty: 15, sku: "MUGI-PB-MG-250" }
    ]
  },
  {
    id: "prod-dark-ridge",
    name: "Mugi Dark Ridge Espresso",
    slug: "mugi-dark-ridge-espresso",
    category: Category.GROUND,
    origin: "Aberdare Range Slopes",
    altitude: "1800 MASL",
    process: "Washed & Drum Roasted",
    roastLevel: RoastLevel.DARK,
    tastingNotes: ["Smoky Cacao", "Brown Sugar", "Bold Toasted Almond"],
    brewingGuide: "Engineered specifically for milk-based espresso beverages, French presses, and stove-top moka pots. Grind is fine and dense to assure a thick, luscious golden crema.",
    bestFor: ["Espresso", "Moka Pot", "French Press"],
    isFeatured: true,
    isActive: true,
    images: ["https://images.unsplash.com/photo-151097252790b-af4f42d91df3?q=80&w=600&auto=format&fit=crop"],
    description: "Our boldest roast, specifically drum-roasted for deep espresso extractions. Packed with flavor notes of bittersweet cacao, deeply caramelized brown sugar, and rich toasted nuts, this selection cuts elegantly through milk.",
    variants: [
      { id: "var-dr-esp-250", productId: "prod-dark-ridge", grindType: GrindType.ESPRESSO, weightGrams: 250, weightLabel: "250g pre-ground", priceKes: 700, stockQty: 60, sku: "MUGI-DR-ES-250" },
      { id: "var-dr-esp-500", productId: "prod-dark-ridge", grindType: GrindType.ESPRESSO, weightGrams: 500, weightLabel: "500g pre-ground", priceKes: 1300, stockQty: 45, sku: "MUGI-DR-ES-500" },
      { id: "var-dr-esp-1000", productId: "prod-dark-ridge", grindType: GrindType.ESPRESSO, weightGrams: 1000, weightLabel: "1kg pre-ground", priceKes: 2400, stockQty: 20, sku: "MUGI-DR-ES-1000" }
    ]
  },
  {
    id: "prod-gold-instant",
    name: "Mugi Instant Gold Soluble",
    slug: "mugi-instant-gold-soluble",
    category: Category.INSTANT,
    origin: "Nairobi Highlands Reserve",
    altitude: "N/A",
    process: "Freeze-Dried Crystals",
    roastLevel: RoastLevel.MEDIUM,
    tastingNotes: ["Caramel", "Malt", "Smooth Milk Chocolate"],
    brewingGuide: "Mix 1-2 teaspoons of Mugi Gold Crystals into 150ml of water just off the boil. Add milk and sugar as desired for a rich, quick daily pick-me-up.",
    bestFor: ["Quick Brew", "Travel", "Mocha Milkshakes"],
    isFeatured: false,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=600&auto=format&fit=crop"],
    description: "Indulge in premium Kenyan coffee convenience with zero compromises. Made with 100% fine Arabica beans freeze-dried to seal in high-altitude aromatics of rich caramel and smooth chocolate.",
    variants: [
      { id: "var-gold-100", productId: "prod-gold-instant", weightGrams: 100, weightLabel: "100g Jar", priceKes: 600, stockQty: 80, sku: "MUGI-GOLD-100" },
      { id: "var-gold-250", productId: "prod-gold-instant", weightGrams: 250, weightLabel: "250g Refill Bag", priceKes: 1200, stockQty: 50, sku: "MUGI-GOLD-250" }
    ]
  },
  {
    id: "prod-mugi-tumbler",
    name: "Mugi Monochrome Insulated Tumbler",
    slug: "mugi-monochrome-insulated-tumbler",
    category: Category.MERCHANDISE,
    origin: "Designed with gomugi.com",
    altitude: "N/A",
    process: "Dual-wall Vacuum Coated",
    roastLevel: RoastLevel.LIGHT,
    tastingNotes: ["Leaf Green Matte", "Heat Holding", "Leak Proof"],
    brewingGuide: "Hand wash with warm water. This companion travel tumbler keeps your freshly brewed Mugi specialty coffee piping hot for up to 12 hours or ice-cold for 24 hours.",
    bestFor: ["Office Use", "Travel", "Highlands Commutes"],
    isFeatured: true,
    isActive: true,
    images: ["/src/assets/images/mugi_tumbler_1780333640007.png"],
    description: "Our signature co-branded travel tumbler, developed in collaboration with gomugi.com. Features a luxurious, durable leaf-green split matte texture finish, custom-insulated steel walls, and secure lock lid that completely shields flavor from ambient exposure.",
    variants: [
      { id: "var-tumb-350", productId: "prod-mugi-tumbler", weightGrams: 350, weightLabel: "350ml Matte Bag", priceKes: 1850, stockQty: 14, sku: "MUGI-TUMB-GR-350" },
      { id: "var-tumb-500", productId: "prod-mugi-tumbler", weightGrams: 500, weightLabel: "500ml Matte Bag", priceKes: 2450, stockQty: 22, sku: "MUGI-TUMB-GR-500" }
    ]
  }
];

export const SEED_DELIVERY_ZONES = [
  { id: "zone-cbd", name: "Nairobi CBD", feeKes: 150, estimatedHours: 3, description: "Nairobi Central Business District. Order before 2:00 PM for same-day delivery." },
  { id: "zone-suburbs-west", name: "Westlands / Kilimani / Upperhill", feeKes: 250, estimatedHours: 4, description: "Includes Westlands, Kilimani, Lavington, Upperhill, Kileleshwa." },
  { id: "zone-suburbs-general", name: "Nairobi Suburbs General", feeKes: 300, estimatedHours: 6, description: "Includes Karen, Langata, Runda, Gigiri, Embakasi, Ruiru, Kasarani." },
  { id: "zone-naivasha-town", name: "Naivasha Town", feeKes: 400, estimatedHours: 24, description: "Naivasha town center. Order before midnight for next business day delivery." },
  { id: "zone-naivasha-out", name: "Naivasha Outskirts / Gilgil", feeKes: 600, estimatedHours: 48, description: "Areas surrounding Naivasha, including Lake Naivasha resorts, Gilgil town." },
  { id: "zone-pickup-nbi", name: "Self Pickup - Nairobi Roastery", feeKes: 0, estimatedHours: 2, description: "Collect from our primary Roastery & Cafe in Nairobi. We'll text open coordinates!" },
  { id: "zone-pickup-nv", name: "Self Pickup - Naivasha Depot", feeKes: 0, estimatedHours: 4, description: "Collect from our Naivasha town distribution terminal." }
];

export const PROMO_CODES = [
  { code: "MUGISTART", discountPercent: 10, isActive: true },
  { code: "FRESHROAST", discountPercent: 15, isActive: true },
  { code: "COFFEELOVE", discountPercent: 20, isActive: true }
];
