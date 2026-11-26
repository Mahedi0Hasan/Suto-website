/* ================================================================
   SUTO CONFIG — change everything about the store here.

   • brand / tagline / contact : text in the header, hero and footer
   • delivery                  : fees in Taka. Also change them in the
                                 suto_place_order function in Supabase.
   • looks                     : the runway looks (add or remove freely)
       bg / ink  : page colour while the look is in front, and its text colour
       image     : the model photo — a transparent PNG/WebP in /public/looks,
                   e.g. "/looks/look1.webp", about 400 × 1040 px, feet at the bottom.
                   Leave "" and fill `outfit` to use a drawn placeholder instead.
       color     : swatch colour shown next to each piece
       pieces    : items in the look. dot = [x, y] position of the white dot
                   on the model (x 0–200, y 0–520).
                   id, price and sizes must match the suto_products table
                   in Supabase — the server uses its own prices at checkout.
   ================================================================ */

export type Lang = "en" | "bn";
export type Text = { en: string; bn: string };
export type Slot = "top" | "bottom" | "layer" | "shoes";
export type Piece = {
  id: string; slot: Slot; kind: string; color: string; name: Text;
  price: number; sizes: string[]; dot: [number, number];
};
export type Outfit = {
  skin: string; hair: "short" | "long" | "bun"; hairColor: string;
  top: { shape: "shirt" | "kurti" | "dress"; color: string };
  bottom: { shape: "trouser" | "wide" | "none"; color: string };
  layer: { shape: "blazer" | "drape" | "none"; color: string };
  shoes: string;
};
export type Look = {
  name: Text; note: Text; gender: "men" | "women"; style: "deshi" | "western";
  bg: string; ink: string; image: string; outfit?: Outfit; pieces: Piece[];
};

export const SUTO = {
  brand: "SUTO",
  tagline: { en: "Made thread by thread", bn: "সুতোয় সুতোয় গড়া" } as Text,
  currency: "৳",
  delivery: { dhaka: 80, outside: 150 },
  contact: {
    phone: "+880 1700-000000",
    email: "hello@suto.example",
    city: { en: "Dhaka, Bangladesh", bn: "ঢাকা, বাংলাদেশ" } as Text,
  },
  looks: [
    {
      name: { en: "Sand Street", bn: "স্যান্ড স্ট্রিট" }, gender: "men", style: "western", bg: "#1f2a37", ink: "#efe7da", image: "/looks/look1.webp",
      note: { en: "A sand twill jacket over a black fleece hoodie, with black cargos and clean white sneakers.", bn: "কালো ফ্লিস হুডির ওপর বালু রঙের টুইল জ্যাকেট, সাথে কালো কার্গো আর সাদা স্নিকার।" },
      pieces: [
        { id: "p1", slot: "layer", kind: "blazer", color: "#d9c7b3", name: { en: "Sand twill jacket", bn: "স্যান্ড টুইল জ্যাকেট" }, price: 4600, sizes: ["S", "M", "L", "XL"], dot: [38, 190] },
        { id: "p2", slot: "top", kind: "shirt", color: "#1a1a1a", name: { en: "Black fleece hoodie", bn: "কালো ফ্লিস হুডি" }, price: 2800, sizes: ["S", "M", "L", "XL"], dot: [100, 175] },
        { id: "p3", slot: "bottom", kind: "trouser", color: "#222222", name: { en: "Black cargo trouser", bn: "কালো কার্গো ট্রাউজার" }, price: 3200, sizes: ["30", "32", "34", "36"], dot: [62, 360] },
      ],
    },
    {
      name: { en: "Maroon Eid", bn: "মেরুন ঈদ" }, gender: "women", style: "deshi", bg: "#ead9c6", ink: "#3d1418", image: "/looks/look2.webp",
      note: { en: "A hand-embroidered maroon kameez with a sheer organza dupatta and straight salwar.", bn: "হাতে এমব্রয়ডারি করা মেরুন কামিজ, পাতলা অর্গাঞ্জা ওড়না আর সোজা সালোয়ার।" },
      pieces: [
        { id: "p4", slot: "top", kind: "kurti", color: "#7a1f2b", name: { en: "Embroidered kameez", bn: "এমব্রয়ডারি কামিজ" }, price: 6800, sizes: ["S", "M", "L"], dot: [78, 300] },
        { id: "p5", slot: "layer", kind: "drape", color: "#8a2a35", name: { en: "Organza dupatta", bn: "অর্গাঞ্জা ওড়না" }, price: 3200, sizes: ["Free"], dot: [148, 300] },
        { id: "p6", slot: "bottom", kind: "trouser", color: "#7a1f2b", name: { en: "Straight salwar", bn: "সোজা সালোয়ার" }, price: 2200, sizes: ["S", "M", "L"], dot: [68, 450] },
      ],
    },
    {
      name: { en: "Weekend Khaki", bn: "উইকেন্ড খাকি" }, gender: "men", style: "western", bg: "#3c4a3a", ink: "#f1ece0", image: "/looks/look3.webp",
      note: { en: "A heavyweight black hoodie, relaxed khaki cargos and black-and-white high-tops.", bn: "ভারী কালো হুডি, ঢিলেঢালা খাকি কার্গো আর সাদা-কালো হাই-টপ স্নিকার।" },
      pieces: [
        { id: "p7", slot: "top", kind: "shirt", color: "#151515", name: { en: "Heavyweight hoodie", bn: "হেভিওয়েট হুডি" }, price: 2800, sizes: ["S", "M", "L", "XL"], dot: [100, 175] },
        { id: "p8", slot: "bottom", kind: "trouser", color: "#c8b48f", name: { en: "Khaki cargo trouser", bn: "খাকি কার্গো ট্রাউজার" }, price: 3200, sizes: ["30", "32", "34", "36"], dot: [78, 360] },
        { id: "p9", slot: "shoes", kind: "shoes", color: "#f2f2f2", name: { en: "High-top sneakers", bn: "হাই-টপ স্নিকার" }, price: 5500, sizes: ["40", "41", "42", "43", "44"], dot: [148, 492] },
      ],
    },
    {
      name: { en: "Chocolate Tailoring", bn: "চকলেট টেইলরিং" }, gender: "women", style: "western", bg: "#20403f", ink: "#f0e9dc", image: "/looks/look4.webp",
      note: { en: "An oversized chocolate blazer, a cream rib-knit top and pleated wide-leg trousers.", bn: "ঢিলে চকলেট ব্লেজার, ক্রিম রিব-নিট টপ আর প্লিট করা চওড়া ট্রাউজার।" },
      pieces: [
        { id: "p10", slot: "layer", kind: "blazer", color: "#3b2418", name: { en: "Chocolate blazer", bn: "চকলেট ব্লেজার" }, price: 7800, sizes: ["S", "M", "L"], dot: [42, 160] },
        { id: "p11", slot: "top", kind: "shirt", color: "#e4d6c2", name: { en: "Rib-knit top", bn: "রিব-নিট টপ" }, price: 2200, sizes: ["S", "M", "L"], dot: [100, 160] },
        { id: "p12", slot: "bottom", kind: "wide", color: "#e8dccb", name: { en: "Pleated wide trouser", bn: "প্লিটেড ওয়াইড ট্রাউজার" }, price: 3600, sizes: ["S", "M", "L"], dot: [72, 380] },
      ],
    },
    {
      name: { en: "Campus Brown", bn: "ক্যাম্পাস ব্রাউন" }, gender: "men", style: "western", bg: "#e2d9cb", ink: "#2b1d14", image: "/looks/look5.webp",
      note: { en: "A washed brown utility jacket over a soft grey hoodie, with black cargos for long days.", bn: "নরম ধূসর হুডির ওপর ওয়াশড বাদামি ইউটিলিটি জ্যাকেট, লম্বা দিনের জন্য কালো কার্গো।" },
      pieces: [
        { id: "p13", slot: "layer", kind: "blazer", color: "#6b4228", name: { en: "Brown utility jacket", bn: "বাদামি ইউটিলিটি জ্যাকেট" }, price: 5200, sizes: ["S", "M", "L", "XL"], dot: [40, 185] },
        { id: "p14", slot: "top", kind: "shirt", color: "#e6e6e3", name: { en: "Soft grey hoodie", bn: "নরম ধূসর হুডি" }, price: 2600, sizes: ["S", "M", "L", "XL"], dot: [100, 215] },
        { id: "p15", slot: "bottom", kind: "trouser", color: "#1c1c1c", name: { en: "Black cargo trouser", bn: "কালো কার্গো ট্রাউজার" }, price: 3200, sizes: ["30", "32", "34", "36"], dot: [70, 375] },
      ],
    },
    {
      name: { en: "Burgundy Knit", bn: "বার্গান্ডি নিট" }, gender: "women", style: "western", bg: "#c9d2da", ink: "#2a1620", image: "/looks/look6.webp",
      note: { en: "A burgundy ribbed turtleneck, cream utility cargos and a structured leather shoulder bag.", bn: "বার্গান্ডি রিবড টার্টলনেক, ক্রিম ইউটিলিটি কার্গো আর শক্ত চামড়ার কাঁধের ব্যাগ।" },
      pieces: [
        { id: "p16", slot: "top", kind: "shirt", color: "#5a1e30", name: { en: "Ribbed turtleneck", bn: "রিবড টার্টলনেক" }, price: 2600, sizes: ["S", "M", "L"], dot: [88, 150] },
        { id: "p17", slot: "bottom", kind: "wide", color: "#e6dccb", name: { en: "Cream utility cargo", bn: "ক্রিম ইউটিলিটি কার্গো" }, price: 3400, sizes: ["S", "M", "L"], dot: [76, 360] },
        { id: "p18", slot: "layer", kind: "bag", color: "#1a1a1a", name: { en: "Leather shoulder bag", bn: "চামড়ার কাঁধের ব্যাগ" }, price: 4800, sizes: ["Free"], dot: [178, 255] },
      ],
    },
  ] as Look[],
};
