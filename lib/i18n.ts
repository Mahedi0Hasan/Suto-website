import type { Lang, Text } from "./config";

/* Every fixed word on the site, in English and Bangla. */
export const T = {
  nav_runway: { en: "Runway", bn: "র‍্যানওয়ে" },
  nav_collection: { en: "Collection", bn: "কালেকশন" },
  nav_about: { en: "Our story", bn: "আমাদের কথা" },
  bag: { en: "Bag", bn: "ব্যাগ" },
  look: { en: "Look", bn: "লুক" },
  add_look: { en: "Add the look", bn: "পুরো লুক নিন" },
  drag: { en: "Drag the runway, use the arrows, or tap a look waiting behind.", bn: "র‍্যানওয়ে টেনে, তীর চেপে বা পেছনের লুকে ট্যাপ করে দেখুন।" },
  coll_title: { en: "The collection", bn: "পুরো কালেকশন" },
  all: { en: "All", bn: "সব" }, women: { en: "Women", bn: "মেয়েদের" }, men: { en: "Men", bn: "ছেলেদের" },
  deshi: { en: "Deshi", bn: "দেশি" }, western: { en: "Western", bn: "ওয়েস্টার্ন" },
  add: { en: "Add to bag", bn: "ব্যাগে নিন" },
  from_look: { en: "From", bn: "লুক:" },
  added: { en: "added to your bag", bn: "ব্যাগে যোগ হয়েছে" },
  look_added: { en: "The full look is in your bag", bn: "পুরো লুক ব্যাগে যোগ হয়েছে" },
  empty: { en: "Your bag is empty. Pick a look from the runway.", bn: "ব্যাগ খালি। র‍্যানওয়ে থেকে একটা লুক বেছে নিন।" },
  size: { en: "Size", bn: "সাইজ" }, remove: { en: "Remove", bn: "সরান" },
  dhaka: { en: "Inside Dhaka", bn: "ঢাকার ভেতরে" }, outside: { en: "Outside Dhaka", bn: "ঢাকার বাইরে" },
  subtotal: { en: "Subtotal", bn: "সাবটোটাল" }, delivery: { en: "Delivery", bn: "ডেলিভারি" }, total: { en: "Total", bn: "মোট" },
  checkout: { en: "Checkout", bn: "অর্ডার করুন" },
  back: { en: "Back to bag", bn: "ব্যাগে ফিরুন" },
  your_details: { en: "Delivery details", bn: "ডেলিভারির তথ্য" },
  f_name: { en: "Full name", bn: "পুরো নাম" },
  f_phone: { en: "Mobile number", bn: "মোবাইল নম্বর" },
  f_address: { en: "Full address", bn: "পুরো ঠিকানা" },
  f_note: { en: "Note (optional)", bn: "নোট (ঐচ্ছিক)" },
  pay: { en: "Payment: cash on delivery", bn: "পেমেন্ট: ক্যাশ অন ডেলিভারি" },
  place: { en: "Place order", bn: "অর্ডার নিশ্চিত করুন" },
  placing: { en: "Placing order…", bn: "অর্ডার হচ্ছে…" },
  thanks: { en: "Thank you! Your order is placed.", bn: "ধন্যবাদ! আপনার অর্ডার হয়েছে।" },
  order_no: { en: "Order number", bn: "অর্ডার নম্বর" },
  call_soon: { en: "We will call you to confirm before delivery.", bn: "ডেলিভারির আগে আমরা ফোন করে নিশ্চিত করব।" },
  keep_shopping: { en: "Keep shopping", bn: "আরও কেনাকাটা করুন" },
  err_name: { en: "Please write your name.", bn: "আপনার নাম লিখুন।" },
  err_phone: { en: "Write a Bangladeshi mobile number, e.g. 01712345678.", bn: "বাংলাদেশি মোবাইল নম্বর লিখুন, যেমন 01712345678।" },
  err_address: { en: "Please write the full address.", bn: "পুরো ঠিকানা লিখুন।" },
  err_fast: { en: "An order from this number was just placed. Please wait a moment.", bn: "এই নম্বর থেকে এইমাত্র অর্ডার হয়েছে। একটু অপেক্ষা করুন।" },
  err_generic: { en: "The order could not be placed. Please try again.", bn: "অর্ডার করা যায়নি। আবার চেষ্টা করুন।" },
  err_config: { en: "Ordering is not connected yet.", bn: "অর্ডার ব্যবস্থা এখনও যুক্ত হয়নি।" },
  story_title: { en: "Made thread by thread", bn: "সুতোয় সুতোয় গড়া" },
  story_1: { en: "SUTO means thread. We start from Bangladeshi cotton, linen and silk, and cut them into pieces that sit as easily at an Eid dinner as in a Toronto office.", bn: "সুতো মানে সুতা। আমরা শুরু করি বাংলাদেশের সুতি, লিনেন আর সিল্ক দিয়ে, আর এমনভাবে কাটি যাতে ঈদের দাওয়াতেও মানায়, বিদেশের অফিসেও।" },
  story_2: { en: "Every look is designed as a whole, so you can buy it the way it walks — or take just the piece you love.", bn: "প্রতিটা লুক একসাথে ডিজাইন করা, তাই র‍্যানওয়েতে যেমন হাঁটে তেমনই কিনতে পারেন — অথবা শুধু পছন্দের পিসটা।" },
  f_shop: { en: "Shop", bn: "শপ" }, f_help: { en: "Help", bn: "সাহায্য" }, f_contact: { en: "Contact", bn: "যোগাযোগ" },
  f_delivery: { en: "Delivery", bn: "ডেলিভারি" }, f_returns: { en: "Returns & exchange", bn: "রিটার্ন ও এক্সচেঞ্জ" }, f_sizes: { en: "Size guide", bn: "সাইজ গাইড" },
  sample: { en: "Placeholder looks, prices and text — replace them in lib/config.ts.", bn: "নমুনা লুক, দাম আর লেখা — lib/config.ts-এ বদলে নিন।" },
} satisfies Record<string, Text>;

export type Key = keyof typeof T;

export const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export const digits = (s: string | number, lang: Lang) =>
  lang === "bn" ? String(s).replace(/\d/g, (d) => BN_DIGITS[+d]) : String(s);
