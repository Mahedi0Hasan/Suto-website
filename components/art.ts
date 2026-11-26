import type { Outfit } from "@/lib/config";

/* Drawn placeholder model (viewBox 200 × 520). Replaced by a photo when a look has `image`. */
export function figureSvg(o: Outfit): string {
  const sk = o.skin, hc = o.hairColor || "#1a1410", top = o.top, bot = o.bottom, lay = o.layer, shoe = o.shoes || "#1b1b1b";
  const trouser = bot.shape === "trouser", wide = bot.shape === "wide";
  const blazer = lay.shape === "blazer", drape = lay.shape === "drape";
  const sleeveLen = top.shape === "dress" ? 40 : top.shape === "kurti" ? 150 : 70;
  const sleeve = blazer
    ? `<rect x="-1" y="-2" width="17" height="152" rx="7" fill="${lay.color}"/>`
    : `<rect x="-1" y="-2" width="17" height="${sleeveLen}" rx="7" fill="${top.color}"/>`;
  const leg = (x: number, cls: string) =>
    `<g class="leg ${cls}"><rect x="${x}" y="272" width="18" height="206" rx="8" fill="${sk}"/>${trouser ? `<rect x="${x - 3}" y="266" width="24" height="206" rx="6" fill="${bot.color}"/>` : ""}<rect x="${x - 5}" y="472" width="27" height="13" rx="6" fill="${shoe}"/></g>`;
  const arm = (x: number, cls: string) =>
    `<g class="arm ${cls}"><g transform="translate(${x} 96)"><rect x="0" y="0" width="15" height="172" rx="7" fill="${sk}"/>${sleeve}</g></g>`;
  const tops: Record<string, string> = {
    shirt: "M62 92 Q100 84 138 92 L134 290 L66 290 Z",
    kurti: "M62 92 Q100 84 138 92 L146 392 L54 392 Z",
    dress: "M66 92 Q100 84 134 92 L130 196 L156 440 L44 440 L70 196 Z",
  };
  const backHair = o.hair === "long" ? `<path d="M73 44 Q100 6 127 44 L134 176 Q100 190 66 176 Z" fill="${hc}"/>` : "";
  const front = {
    short: `<path d="M78 44 Q78 14 100 14 Q123 14 122 44 Q113 28 100 28 Q87 28 78 44Z" fill="${hc}"/>`,
    long: `<path d="M77 50 Q76 14 100 14 Q124 14 123 50 Q114 26 100 26 Q86 26 77 50Z" fill="${hc}"/>`,
    bun: `<circle cx="100" cy="14" r="11" fill="${hc}"/><path d="M78 44 Q78 18 100 18 Q122 18 122 44 Q112 30 100 30 Q88 30 78 44Z" fill="${hc}"/>`,
  }[o.hair];
  return `<svg viewBox="0 0 200 520" aria-hidden="true">
    <ellipse cx="100" cy="500" rx="58" ry="9" fill="#000" opacity=".22"/>
    ${backHair}${leg(80, "legL")}${leg(102, "legR")}
    ${wide ? `<path d="M70 266 L50 478 L98 478 L100 330 L102 478 L150 478 L130 266Z" fill="${bot.color}"/>` : ""}
    ${arm(50, "armL")}${arm(135, "armR")}
    <rect x="92" y="64" width="16" height="32" rx="6" fill="${sk}"/>
    <path d="${tops[top.shape] || tops.shirt}" fill="${top.color}"/>
    <path d="M90 90 L100 108 L110 90" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="2.5"/>
    ${blazer ? `<path d="M58 92 L96 98 L90 304 L56 304Z" fill="${lay.color}"/><path d="M142 92 L104 98 L110 304 L144 304Z" fill="${lay.color}"/><path d="M96 98 L80 160 M104 98 L120 160" stroke="rgba(0,0,0,.2)" stroke-width="2.5"/>` : ""}
    ${drape ? `<path d="M60 94 L82 90 L146 300 L124 310Z" fill="${lay.color}"/><path d="M56 96 L74 98 L68 272 L50 260Z" fill="${lay.color}"/><path d="M50 260 l2 10 M56 264 l2 10 M62 268 l2 10" stroke="${lay.color}" stroke-width="2"/>` : ""}
    <ellipse cx="100" cy="44" rx="21" ry="25" fill="${sk}"/>
    ${front}
  </svg>`;
}

/* Small garment icons for collection cards (viewBox 100 × 100). */
const ICONS: Record<string, string> = {
  kurti: "M30 14 L44 10 Q50 18 56 10 L70 14 L88 34 L78 44 L70 36 L75 92 L25 92 L30 36 L22 44 L12 34Z",
  shirt: "M30 16 L42 12 Q50 20 58 12 L70 16 L88 34 L78 44 L70 38 L70 88 L30 88 L30 38 L22 44 L12 34Z",
  blazer: "M30 16 L42 12 L50 40 L58 12 L70 16 L88 34 L80 80 L70 70 L70 90 L30 90 L30 70 L20 80 L12 34Z",
  trouser: "M30 8 L70 8 L75 92 L56 92 L50 38 L44 92 L25 92Z",
  wide: "M30 8 L70 8 L86 92 L54 92 L50 42 L46 92 L14 92Z",
  dress: "M40 8 L44 8 L46 20 L54 20 L56 8 L60 8 L60 34 L80 92 L20 92 L40 34Z",
  drape: "M18 16 Q50 32 82 16 L78 84 Q50 70 22 84Z",
  shoes: "M12 58 L38 58 Q46 70 60 70 L84 72 Q90 80 86 86 L12 86Z",
  bag: "M28 40 L72 40 L80 88 L20 88Z M38 40 Q38 18 50 18 Q62 18 62 40",
};
export function iconSvg(kind: string, color: string): string {
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${ICONS[kind] || ICONS.shirt}" fill="${color}" stroke="rgba(0,0,0,.18)" stroke-width="1.5" stroke-linejoin="round"/>${kind === "blazer" ? '<path d="M50 40 L50 90" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/>' : ""}</svg>`;
}
