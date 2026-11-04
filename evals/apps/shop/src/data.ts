export type Product = {
  id: string;
  name: string;
  category: "Clothing" | "Footwear" | "Equipment";
  price: number;
  image: string;
  description: string;
  specs: Record<string, string>;
};

export const products: Product[] = [
  {
    id: "rain-jacket",
    name: "Rain jacket",
    category: "Clothing",
    price: 18900,
    image: "/products/jacket.svg",
    description: "A waterproof, breathable shell for wet days on the trail.",
    specs: { Weight: "380 g", Waterproofing: "20,000 mm", Fit: "Regular" },
  },
  {
    id: "hiking-boot",
    name: "Hiking boot",
    category: "Footwear",
    price: 21900,
    image: "/products/boot.svg",
    description: "Leather boot with a grippy sole for rock and mud.",
    specs: { Weight: "640 g per boot", Upper: "Nubuck leather", Drop: "10 mm" },
  },
  {
    id: "day-pack",
    name: "Day pack 24 L",
    category: "Equipment",
    price: 9900,
    image: "/products/pack.svg",
    description: "A light pack with a ventilated back panel and a rain cover.",
    specs: { Volume: "24 L", Weight: "820 g", "Hip belt": "Yes" },
  },
  {
    id: "water-bottle",
    name: "Insulated bottle",
    category: "Equipment",
    price: 3400,
    image: "/products/bottle.svg",
    description: "Keeps drinks cold for 24 hours and hot for 12.",
    specs: { Volume: "750 ml", Weight: "390 g", Material: "Stainless steel" },
  },
  {
    id: "trail-tent",
    name: "Two-person tent",
    category: "Equipment",
    price: 32900,
    image: "/products/tent.svg",
    description: "A freestanding tent that pitches in five minutes.",
    specs: { Weight: "1.9 kg", Sleeps: "2", Seasons: "3" },
  },
  {
    id: "wool-beanie",
    name: "Wool beanie",
    category: "Clothing",
    price: 2900,
    image: "/products/beanie.svg",
    description: "Merino wool, warm when wet and soft on skin.",
    specs: { Material: "100% merino", Weight: "60 g", Size: "One size" },
  },
];

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(
    cents / 100
  );
