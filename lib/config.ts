/* ================================================================
   SUTO CONFIG — change everything about the store here.

   • brand / tagline / contact : text in the header, hero and footer
   • delivery                  : fees in Taka. Also change them in the
                                 suto_place_order function in Supabase.
   • looks                     : the runway looks (add or remove freely)
       bg / ink  : page colour while the look is in front, and its text colour
       image     : "" = drawn placeholder model. For a real photo, put a
                   transparent PNG in /public/looks and write "/looks/look1.png"
       outfit    : colours of the drawn placeholder
       pieces    : items in the look. dot = [x, y] position of the white dot
                   on the model (x 0–200, y 0–520).
                   id, price and sizes must match the suto_products table
                   in Supabase — the server uses its own prices at checkout.
   ================================================================ */

export type Lang = "en" | "bn";
export type Text = { en: string; bn: string };
export type Slot = "top" | "bottom" | "layer" | "shoes";
export type Piece = {
  id: string; slot: Slot; kind: string; name: Text;
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
  bg: string; ink: string; image: string; outfit: Outfit; pieces: Piece[];
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
      name: { en: "Indigo Eid", bn: "নীল ঈদ" }, gender: "men", style: "deshi", bg: "#1e3557", ink: "#f3ecdf", image: "",
      note: { en: "A hand-finished cotton panjabi with a mustard shawl for evening prayers and long dinners.", bn: "হাতে ফিনিশ করা সুতির পাঞ্জাবি, সন্ধ্যার নামাজ আর লম্বা দাওয়াতের জন্য সরষে রঙের শাল।" },
      outfit: { skin: "#8a5a3c", hair: "short", hairColor: "#1a1410", top: { shape: "kurti", color: "#efe6d2" }, bottom: { shape: "trouser", color: "#cdbb97" }, layer: { shape: "drape", color: "#d6a03a" }, shoes: "#3b2a1e" },
      pieces: [
        { id: "p1", slot: "top", kind: "kurti", name: { en: "Cotton panjabi", bn: "সুতির পাঞ্জাবি" }, price: 4200, sizes: ["S", "M", "L", "XL"], dot: [96, 350] },
        { id: "p2", slot: "bottom", kind: "trouser", name: { en: "Pajama trouser", bn: "পায়জামা" }, price: 2200, sizes: ["S", "M", "L", "XL"], dot: [89, 435] },
        { id: "p3", slot: "layer", kind: "drape", name: { en: "Mustard shawl", bn: "সরষে রঙের শাল" }, price: 3500, sizes: ["Free"], dot: [62, 170] },
      ],
    },
    {
      name: { en: "Rose Kurti", bn: "গোলাপি কুর্তি" }, gender: "women", style: "deshi", bg: "#e7b3b6", ink: "#3b1820", image: "",
      note: { en: "An embroidered kurti over wide palazzos, finished with a light gold dupatta.", bn: "চওড়া পালাজোর ওপর এমব্রয়ডারি করা কুর্তি, সাথে হালকা সোনালি ওড়না।" },
      outfit: { skin: "#b97c56", hair: "long", hairColor: "#241712", top: { shape: "kurti", color: "#7d1d3f" }, bottom: { shape: "wide", color: "#f4e3c3" }, layer: { shape: "drape", color: "#d9ab55" }, shoes: "#7d1d3f" },
      pieces: [
        { id: "p4", slot: "top", kind: "kurti", name: { en: "Embroidered kurti", bn: "এমব্রয়ডারি কুর্তি" }, price: 3800, sizes: ["S", "M", "L"], dot: [96, 345] },
        { id: "p5", slot: "bottom", kind: "wide", name: { en: "Palazzo", bn: "পালাজো" }, price: 2400, sizes: ["S", "M", "L"], dot: [124, 440] },
        { id: "p6", slot: "layer", kind: "drape", name: { en: "Chiffon dupatta", bn: "শিফন ওড়না" }, price: 2000, sizes: ["Free"], dot: [62, 170] },
      ],
    },
    {
      name: { en: "Olive Tailoring", bn: "অলিভ টেইলরিং" }, gender: "men", style: "western", bg: "#56653a", ink: "#f2efe3", image: "",
      note: { en: "An unlined linen blazer, crisp Oxford shirt and a tapered trouser for warm-city offices.", bn: "গরম শহরের অফিসের জন্য লাইনিং ছাড়া লিনেন ব্লেজার, মচমচে অক্সফোর্ড শার্ট আর টেপার্ড ট্রাউজার।" },
      outfit: { skin: "#c08560", hair: "short", hairColor: "#2a1d14", top: { shape: "shirt", color: "#f7f5ef" }, bottom: { shape: "trouser", color: "#24231f" }, layer: { shape: "blazer", color: "#e1d6bd" }, shoes: "#4a2f1e" },
      pieces: [
        { id: "p7", slot: "layer", kind: "blazer", name: { en: "Linen blazer", bn: "লিনেন ব্লেজার" }, price: 7900, sizes: ["38", "40", "42", "44"], dot: [72, 230] },
        { id: "p8", slot: "top", kind: "shirt", name: { en: "Oxford shirt", bn: "অক্সফোর্ড শার্ট" }, price: 2600, sizes: ["S", "M", "L", "XL"], dot: [100, 170] },
        { id: "p9", slot: "bottom", kind: "trouser", name: { en: "Tailored trouser", bn: "টেইলর্ড ট্রাউজার" }, price: 3200, sizes: ["30", "32", "34", "36"], dot: [111, 395] },
      ],
    },
    {
      name: { en: "Saffron Midi", bn: "জাফরানি মিডি" }, gender: "women", style: "western", bg: "#ef9f3c", ink: "#2b1606", image: "",
      note: { en: "A maroon midi dress, a cropped linen jacket and block-heel mules — day to night.", bn: "মেরুন মিডি ড্রেস, ছোট লিনেন জ্যাকেট আর ব্লক-হিল মিউল — দিন থেকে রাত।" },
      outfit: { skin: "#8d5a3b", hair: "bun", hairColor: "#140d0a", top: { shape: "dress", color: "#7a2b24" }, bottom: { shape: "none", color: "" }, layer: { shape: "blazer", color: "#f6ead2" }, shoes: "#f6ead2" },
      pieces: [
        { id: "p10", slot: "top", kind: "dress", name: { en: "Midi dress", bn: "মিডি ড্রেস" }, price: 5600, sizes: ["XS", "S", "M", "L"], dot: [100, 390] },
        { id: "p11", slot: "layer", kind: "blazer", name: { en: "Cropped linen jacket", bn: "ক্রপড লিনেন জ্যাকেট" }, price: 4800, sizes: ["S", "M", "L"], dot: [128, 230] },
        { id: "p12", slot: "shoes", kind: "shoes", name: { en: "Block-heel mules", bn: "ব্লক-হিল মিউল" }, price: 3200, sizes: ["36", "37", "38", "39", "40"], dot: [87, 480] },
      ],
    },
    {
      name: { en: "Charcoal Street", bn: "চারকোল স্ট্রিট" }, gender: "men", style: "western", bg: "#26272b", ink: "#f0eee9", image: "",
      note: { en: "A rust overshirt over a heavyweight tee, with roomy cargo trousers for the weekend.", bn: "ভারী টি-শার্টের ওপর মরিচা রঙের ওভারশার্ট, ছুটির দিনের জন্য ঢিলেঢালা কার্গো ট্রাউজার।" },
      outfit: { skin: "#a8714c", hair: "short", hairColor: "#111111", top: { shape: "shirt", color: "#e8e6e1" }, bottom: { shape: "trouser", color: "#6f735e" }, layer: { shape: "blazer", color: "#c4553a" }, shoes: "#e8e6e1" },
      pieces: [
        { id: "p13", slot: "layer", kind: "blazer", name: { en: "Rust overshirt", bn: "রাস্ট ওভারশার্ট" }, price: 4400, sizes: ["S", "M", "L", "XL"], dot: [72, 240] },
        { id: "p14", slot: "top", kind: "shirt", name: { en: "Heavyweight tee", bn: "হেভিওয়েট টি-শার্ট" }, price: 2000, sizes: ["S", "M", "L", "XL"], dot: [100, 170] },
        { id: "p15", slot: "bottom", kind: "trouser", name: { en: "Cargo trouser", bn: "কার্গো ট্রাউজার" }, price: 3600, sizes: ["30", "32", "34", "36"], dot: [111, 400] },
      ],
    },
  ] as Look[],
};
