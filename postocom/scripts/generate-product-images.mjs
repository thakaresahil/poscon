// Generates the illustrated product images in public/products.
// Run with: node scripts/generate-product-images.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../public/products");

// ---------- colour helpers ----------
const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));
const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb) => `#${rgb.map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`;
const mix = (a, b, amount) => toHex(toRgb(a).map((v, i) => v + (toRgb(b)[i] - v) * amount));
const darken = (hex, amount) => mix(hex, "#000000", amount);
const lighten = (hex, amount) => mix(hex, "#ffffff", amount);

// ---------- shared pieces ----------
const mirror = (d) => `<g transform="translate(400,0) scale(-1,1)">${d}</g>`;
const both = (d) => `${d}${mirror(d)}`;
const shadow = (y = 458, rx = 120) => `<ellipse cx="200" cy="${y}" rx="${rx}" ry="12" fill="#000" opacity="0.07"/>`;
const stitch = (d, color, width = 1.6) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-dasharray="5 4" stroke-linecap="round"/>`;
const line = (d, color, width = 2) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const buttons = (x, ys, color, r = 3.6) => ys.map((y) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`).join("");

const svg = (bg, body, defs = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
<defs>${defs}</defs>
<rect width="400" height="500" fill="${bg}"/>
${body}
</svg>
`;

// Applies a fill and a soft side shade to a shape
const garment = (d, color, extra = "") =>
  `<path d="${d}" fill="${color}" stroke="${darken(color, 0.25)}" stroke-width="2" stroke-linejoin="round" ${extra}/>`;

// ---------- patterns ----------
const patterns = {
  check: (id, a, b) =>
    `<pattern id="${id}" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="${a}"/><rect width="14" height="36" fill="${b}" opacity="0.55"/><rect width="36" height="14" fill="${b}" opacity="0.55"/><rect x="24" width="2" height="36" fill="#fff" opacity="0.35"/><rect y="24" width="36" height="2" fill="#fff" opacity="0.35"/></pattern>`,
  stripes: (id, a, b) =>
    `<pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="${a}"/><rect width="24" height="10" fill="${b}"/></pattern>`,
  floral: (id, a, b, c) =>
    `<pattern id="${id}" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="${a}"/>` +
    [[15, 15], [45, 45]].map(([x, y]) =>
      [0, 72, 144, 216, 288].map((r) => `<ellipse cx="${x}" cy="${y - 6}" rx="3.5" ry="6" fill="${b}" transform="rotate(${r} ${x} ${y})"/>`).join("") +
      `<circle cx="${x}" cy="${y}" r="2.6" fill="${c}"/>`).join("") +
    `<path d="M40 14 q6 -4 10 2 M12 44 q6 4 10 -2" stroke="${c}" stroke-width="2" fill="none" opacity="0.7"/></pattern>`,
  motif: (id, a, b) =>
    `<pattern id="${id}" width="34" height="34" patternUnits="userSpaceOnUse"><rect width="34" height="34" fill="${a}"/><circle cx="17" cy="17" r="5" fill="none" stroke="${b}" stroke-width="2"/><circle cx="17" cy="17" r="1.6" fill="${b}"/><circle cx="0" cy="0" r="2" fill="${b}"/><circle cx="34" cy="0" r="2" fill="${b}"/><circle cx="0" cy="34" r="2" fill="${b}"/><circle cx="34" cy="34" r="2" fill="${b}"/></pattern>`,
  paisley: (id, a, b, c) =>
    `<pattern id="${id}" width="56" height="56" patternUnits="userSpaceOnUse"><rect width="56" height="56" fill="${a}"/><path d="M14 30 q-8 -14 6 -20 q10 -2 8 10 q-2 8 -14 10 z" fill="${b}"/><circle cx="18" cy="18" r="2.5" fill="${c}"/><path d="M42 54 q-8 -14 6 -20 q10 -2 8 10 q-2 8 -14 10 z" fill="${c}"/><circle cx="46" cy="42" r="2.5" fill="${b}"/></pattern>`,
  knit: (id, a) =>
    `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${a}"/><path d="M0 0 L5 6 L10 0" fill="none" stroke="${darken(a, 0.12)}" stroke-width="1.4"/></pattern>`,
  mesh: (id, a) =>
    `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="${a}"/><path d="M0 6 L6 0" stroke="${darken(a, 0.18)}" stroke-width="1"/></pattern>`,
};

// ---------- garment templates ----------
const SHIRT_BODY = "M170,100 L110,126 L108,422 Q200,434 292,422 L290,126 L230,100 Q200,118 170,100 Z";
const LONG_SLEEVE = "M110,126 L68,322 L100,332 L130,205 Z";

const templates = {
  shirt: ({ color, fill = color, pockets = false, stitchColor, bg }) => {
    const detail = darken(color, 0.3);
    return svg(bg || lighten(color, 0.82), `
${shadow()}
${both(garment(LONG_SLEEVE, fill))}
${both(`<rect x="66" y="314" width="36" height="16" rx="3" fill="${fill}" stroke="${detail}" stroke-width="2" transform="rotate(12 84 322)"/>`)}
${garment(SHIRT_BODY, fill)}
<path d="M200,128 L200,428" stroke="${detail}" stroke-width="2"/>
${buttons(207, [150, 190, 230, 270, 310, 350, 390], lighten(color, 0.6) === "#ffffff" ? "#cbd5e1" : lighten(color, 0.6))}
${both(`<path d="M170,100 L200,130 L184,146 L158,110 Z" fill="${lighten(color, 0.15)}" stroke="${detail}" stroke-width="2" stroke-linejoin="round"/>`)}
${pockets ? both(`<rect x="128" y="160" width="46" height="52" rx="4" fill="${fill}" stroke="${detail}" stroke-width="2"/><path d="M126,160 L176,160 L176,176 L151,184 L126,176 Z" fill="${lighten(color, 0.08)}" stroke="${detail}" stroke-width="2"/>`) : `<rect x="128" y="165" width="40" height="44" rx="3" fill="none" stroke="${detail}" stroke-width="1.6" opacity="0.7"/>`}
${stitchColor ? stitch("M112,410 Q200,420 288,410", stitchColor) : ""}`, fill.startsWith("url") ? patterns.check("check", color, "#1e2a4a") : "");
  },

  tshirt: ({ color, graphic = false, polo = false, bg }) => {
    const detail = darken(color, 0.3);
    const body = "M170,100 L120,118 L118,422 Q200,432 282,422 L280,118 L230,100 Q200,128 170,100 Z";
    return svg(bg || lighten(color, 0.8), `
${shadow()}
${both(garment("M120,118 L70,178 L100,210 L126,182 Z", color))}
${garment(body, color)}
${both(line("M76,184 L98,205", detail, 2))}
${polo
  ? `${both(`<path d="M170,100 L200,124 L190,140 L160,106 Z" fill="${lighten(color, 0.1)}" stroke="${detail}" stroke-width="2" stroke-linejoin="round"/>`)}<rect x="193" y="118" width="14" height="52" fill="${lighten(color, 0.05)}" stroke="${detail}" stroke-width="2"/>${buttons(200, [134, 152], "#e5e7eb", 3)}`
  : `<path d="M170,100 Q200,128 230,100" fill="none" stroke="${detail}" stroke-width="7" stroke-linecap="round"/>`}
${graphic ? `<circle cx="200" cy="215" r="44" fill="#f59e0b"/><rect x="150" y="215" width="100" height="50" fill="${color}"/><path d="M152,232 q12 -10 24 0 t24 0 t24 0 t24 0 M152,250 q12 -10 24 0 t24 0 t24 0 t24 0" fill="none" stroke="#0ea5e9" stroke-width="5" stroke-linecap="round"/><text x="200" y="300" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="22" fill="${darken(color, 0.6)}">SUNSET</text>` : ""}`);
  },

  pants: ({ color, fit = "straight", jeans = true, bg }) => {
    const detail = darken(color, 0.3);
    const hems = { straight: [132, 190], tapered: [146, 190], skinny: [154, 192], wide: [108, 198], palazzo: [86, 198] };
    const [outer, inner] = hems[fit];
    const leg = `M128,112 L200,112 L200,182 L${inner},444 L${outer},444 Z`;
    return svg(bg || lighten(color, 0.82), `
${shadow(452, 130)}
${both(garment(leg, color))}
<rect x="126" y="86" width="148" height="28" rx="3" fill="${darken(color, 0.06)}" stroke="${detail}" stroke-width="2"/>
${[140, 176, 224, 260].map((x) => `<rect x="${x - 3}" y="84" width="6" height="32" rx="2" fill="${darken(color, 0.12)}"/>`).join("")}
<circle cx="200" cy="100" r="5" fill="${jeans ? "#b45309" : darken(color, 0.4)}"/>
${line("M200,114 L200,170", detail, 2)}
${both(line("M134,122 Q160,150 176,120", detail, 2))}
${jeans ? stitch("M206,116 L206,166 Q206,176 196,176", "#d97706") + both(stitch(`M134,126 Q160,154 178,124 M${outer + 4},436 L${inner - 4},436`, "#d97706")) : both(line(`M${(outer + inner) / 2 + 2},190 L${(outer + inner) / 2},440`, darken(color, 0.12), 2))}`);
  },

  kurta: ({ color, bg, motif }) => {
    const detail = darken(color, 0.3);
    return svg(bg || lighten(color, 0.8), `
${shadow()}
${both(garment("M118,118 L82,292 L110,300 L136,200 Z", motif ? "url(#motif)" : color))}
${garment("M175,96 L118,118 L112,452 L288,452 L282,118 L225,96 Q200,108 175,96 Z", motif ? "url(#motif)" : color)}
<rect x="176" y="88" width="48" height="14" rx="5" fill="${darken(color, 0.1)}" stroke="${detail}" stroke-width="2"/>
<rect x="193" y="102" width="14" height="96" fill="${lighten(color, 0.12)}" stroke="${detail}" stroke-width="2"/>
${buttons(200, [118, 140, 162, 184], lighten(color, 0.55), 3)}
${both(line("M114,388 L124,452", detail, 2))}
${both(`<rect x="84" y="288" width="28" height="10" rx="2" fill="${darken(color, 0.1)}" transform="rotate(14 98 293)"/>`)}`,
    motif ? patterns.motif("motif", color, lighten(color, 0.5)) : "");
  },

  anarkali: ({ color, accent, bg }) => {
    const detail = darken(color, 0.3);
    return svg(bg || lighten(color, 0.82), `
${shadow(462, 140)}
${both(garment("M140,116 L100,300 L124,306 L156,190 Z", color))}
<path d="M140,220 L68,454 Q200,478 332,454 L260,220 Z" fill="url(#motif)" stroke="${detail}" stroke-width="2" stroke-linejoin="round"/>
<path d="M76,430 Q200,452 324,430 L332,454 Q200,478 68,454 Z" fill="${accent}"/>
${garment("M178,96 L140,116 L142,222 L258,222 L260,116 L222,96 Q200,112 178,96 Z", color)}
<path d="M142,214 Q200,226 258,214 L258,224 Q200,236 142,224 Z" fill="${accent}"/>
<path d="M178,96 Q200,130 222,96" fill="none" stroke="${accent}" stroke-width="4"/>
${both(line("M150,262 L130,440 M175,266 L170,452", darken(color, 0.15), 1.6))}`,
    patterns.motif("motif", color, accent));
  },

  hoodie: ({ color, bg }) => {
    const detail = darken(color, 0.35);
    return svg(bg || lighten(color, 0.85), `
${shadow()}
<path d="M150,118 Q148,58 200,52 Q252,58 250,118 Z" fill="${darken(color, 0.12)}" stroke="${detail}" stroke-width="2"/>
${both(garment("M118,126 L74,330 L106,340 L134,206 Z", color))}
${both(`<rect x="72" y="322" width="36" height="20" rx="4" fill="${darken(color, 0.1)}" stroke="${detail}" stroke-width="2" transform="rotate(12 90 332)"/>`)}
${garment("M168,104 L118,126 L116,404 L284,404 L282,126 L232,104 Q200,140 168,104 Z", color)}
<rect x="116" y="398" width="168" height="26" rx="4" fill="${darken(color, 0.1)}" stroke="${detail}" stroke-width="2"/>
<path d="M150,300 L250,300 L264,380 L136,380 Z" fill="${lighten(color, 0.04)}" stroke="${detail}" stroke-width="2" stroke-linejoin="round"/>
<path d="M168,104 Q200,150 232,104" fill="${darken(color, 0.25)}" stroke="${detail}" stroke-width="2"/>
${line("M188,128 L184,196 M212,128 L216,196", lighten(color, 0.55), 3)}`);
  },

  bomber: ({ color, bg }) => {
    const detail = darken(color, 0.3);
    const rib = darken(color, 0.35);
    return svg(bg || lighten(color, 0.82), `
${shadow()}
${both(garment("M116,126 L64,316 Q70,334 100,334 L136,206 Z", color))}
${both(`<rect x="66" y="318" width="38" height="22" rx="5" fill="${rib}" transform="rotate(12 85 329)"/>`)}
${both(`<rect x="92" y="200" width="20" height="30" rx="3" fill="${darken(color, 0.08)}" stroke="${detail}" stroke-width="1.6" transform="rotate(12 102 215)"/>`)}
${garment("M170,102 L116,126 L114,392 L286,392 L284,126 L230,102 Q200,122 170,102 Z", color)}
<rect x="114" y="386" width="172" height="30" rx="5" fill="${rib}"/>
${line("M120,394 L280,394 M120,404 L280,404", darken(rib, 0.2), 1.4)}
<path d="M168,102 Q200,126 232,102 L236,94 Q200,118 164,94 Z" fill="${rib}"/>
<path d="M200,120 L200,416" stroke="#c0c4cc" stroke-width="4"/>
${line("M200,120 L200,416", "#8b9099", 1.2)}
${both(line("M140,300 L176,290", detail, 3))}`);
  },

  jacket: ({ color, bg }) => {
    const detail = darken(color, 0.3);
    return svg(bg || lighten(color, 0.82), `
${shadow()}
${both(garment(LONG_SLEEVE, color))}
${both(`<rect x="66" y="314" width="36" height="16" rx="3" fill="${darken(color, 0.08)}" stroke="${detail}" stroke-width="2" transform="rotate(12 84 322)"/>`)}
${garment("M170,100 L110,126 L110,396 L290,396 L290,126 L230,100 Q200,118 170,100 Z", color)}
<rect x="110" y="380" width="180" height="26" rx="2" fill="${darken(color, 0.06)}" stroke="${detail}" stroke-width="2"/>
${both(`<path d="M170,100 L200,132 L182,150 L150,112 Z" fill="${darken(color, 0.06)}" stroke="${detail}" stroke-width="2" stroke-linejoin="round"/>`)}
${both(`<path d="M128,178 L176,178 L176,198 L152,208 L128,198 Z" fill="${darken(color, 0.06)}" stroke="${detail}" stroke-width="2" stroke-linejoin="round"/>`)}
${both(stitch("M132,226 L132,372 M172,222 L172,372 M128,214 L176,214", "#d97706"))}
<path d="M200,132 L200,406" stroke="${detail}" stroke-width="2"/>
${buttons(208, [160, 210, 260, 310, 360, 393], "#b45309", 4)}`);
  },

  cardigan: ({ color, bg }) => {
    const detail = darken(color, 0.25);
    return svg(bg || lighten(color, 0.7), `
${shadow()}
${both(garment(LONG_SLEEVE, "url(#knit)"))}
${both(`<rect x="66" y="312" width="38" height="20" rx="3" fill="${darken(color, 0.1)}" transform="rotate(12 85 322)"/>`)}
${garment("M176,100 L110,126 L108,420 L292,420 L290,126 L224,100 L200,250 Z", "url(#knit)")}
<path d="M176,100 L200,250 L224,100" fill="none" stroke="${darken(color, 0.12)}" stroke-width="12" stroke-linejoin="round"/>
<path d="M200,250 L200,420" stroke="${darken(color, 0.12)}" stroke-width="12"/>
<rect x="108" y="404" width="184" height="20" fill="${darken(color, 0.1)}"/>
${buttons(206, [270, 310, 350, 390], "#7c5a3a", 4.5)}`, patterns.knit("knit", color));
  },

  dress: ({ style, color, fill = color, bg }) => {
    const detail = darken(color, 0.3);
    if (style === "maxi") {
      return svg(bg || lighten(color, 0.6), `
${shadow(468, 140)}
${both(line("M172,80 L176,120", darken(color, 0.4), 3))}
<path d="M160,120 L240,120 L246,210 L330,462 Q200,482 70,462 L154,210 Z" fill="${fill}" stroke="${detail}" stroke-width="2" stroke-linejoin="round"/>
<path d="M156,206 Q200,218 244,206 L246,218 Q200,230 154,218 Z" fill="${darken(color, 0.25)}"/>
${both(line("M170,240 L130,450 M190,244 L180,462", darken(color, 0.15), 1.4))}`,
      patterns.floral("floral", color, "#e11d48", "#16a34a"));
    }
    if (style === "wrap") {
      return svg(bg || lighten(color, 0.82), `
${shadow()}
${both(garment("M146,112 L106,170 L130,190 L150,160 Z", color))}
<path d="M170,96 L146,112 L150,220 L106,420 Q200,440 294,420 L250,220 L254,112 L230,96 L200,170 Z" fill="${color}" stroke="${detail}" stroke-width="2" stroke-linejoin="round"/>
<path d="M230,96 L170,220" stroke="${detail}" stroke-width="2"/>
<path d="M150,212 L250,212 L250,230 L150,230 Z" fill="${darken(color, 0.12)}"/>
<path d="M250,222 Q272,250 262,300 M250,222 Q284,236 290,280" fill="none" stroke="${darken(color, 0.12)}" stroke-width="7" stroke-linecap="round"/>
${line("M180,236 L150,410 M222,236 L250,410", darken(color, 0.15), 1.4)}`);
    }
    return svg(bg || lighten(color, 0.8), `
${shadow()}
<path d="M168,94 Q200,124 232,94 L262,106 L268,160 L286,392 Q200,404 114,392 L132,160 L138,106 Z" fill="${color}" stroke="${detail}" stroke-width="2" stroke-linejoin="round"/>
<path d="M168,94 Q200,124 232,94" fill="none" stroke="${detail}" stroke-width="5"/>
${both(line("M150,200 L140,384", darken(color, 0.15), 1.6))}`);
  },

  top: ({ style, color, fill = color, bg }) => {
    const detail = darken(color, 0.28);
    if (style === "ruffle") {
      return svg(bg || "#fde7ec", `
${shadow(380, 100)}
${garment("M172,104 Q200,126 228,104 L262,116 L270,350 Q200,362 130,350 L138,116 Z", color)}
${both(`<path d="M138,116 Q110,112 96,136 Q104,150 100,166 Q118,168 126,182 Q136,170 140,160 Z" fill="${color}" stroke="${detail}" stroke-width="2" stroke-linejoin="round"/>`)}
<path d="M172,104 Q200,126 228,104" fill="none" stroke="${detail}" stroke-width="3"/>
${line("M200,128 L200,200", detail, 1.4)}`);
    }
    if (style === "stripes") {
      return svg(bg || "#e0e7ff", `
${shadow(400, 110)}
${both(garment("M124,116 L84,258 L112,268 L140,180 Z", fill))}
${garment("M160,100 L124,116 L124,380 Q200,392 276,380 L276,116 L240,100 Q200,108 160,100 Z", fill)}
<path d="M160,100 Q200,108 240,100" fill="none" stroke="${detail}" stroke-width="4"/>`,
      patterns.stripes("stripes", "#ffffff", color));
    }
    return svg(bg || lighten(color, 0.55), `
${shadow(410, 110)}
${both(garment("M122,118 L80,318 L108,326 L140,200 Z", "url(#sheen)"))}
${garment("M172,100 L122,118 L120,392 Q200,404 280,392 L278,118 L228,100 L200,170 Z", "url(#sheen)")}
<path d="M172,100 L200,170 L228,100" fill="none" stroke="${detail}" stroke-width="3" stroke-linejoin="round"/>
${buttons(200, [200, 240, 280, 320], lighten(color, 0.6), 3.5)}`,
    `<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(color, 0.25)}"/><stop offset="0.45" stop-color="${color}"/><stop offset="0.55" stop-color="${lighten(color, 0.35)}"/><stop offset="1" stop-color="${darken(color, 0.08)}"/></linearGradient>`);
  },

  belt: ({ color, bg }) => svg(bg || "#f5ede4", `
${shadow(330, 150)}
<g transform="rotate(-14 200 250)">
<rect x="60" y="226" width="300" height="48" rx="8" fill="${color}" stroke="${darken(color, 0.3)}" stroke-width="2"/>
${stitch("M70,234 L350,234 M70,266 L350,266", lighten(color, 0.35))}
${[250, 280, 310].map((x) => `<ellipse cx="${x}" cy="250" rx="4" ry="5" fill="${darken(color, 0.45)}"/>`).join("")}
<rect x="36" y="214" width="62" height="72" rx="10" fill="none" stroke="#a8adb5" stroke-width="9"/>
<rect x="36" y="214" width="62" height="72" rx="10" fill="none" stroke="#e5e7eb" stroke-width="3"/>
<rect x="62" y="244" width="40" height="12" rx="4" fill="#a8adb5"/>
</g>`),

  watch: ({ strap, metal, dial = "#ffffff", mesh = false, bg }) => svg(bg || lighten(metal, 0.8), `
${shadow(448, 80)}
<rect x="168" y="50" width="64" height="400" rx="16" fill="${mesh ? "url(#mesh)" : strap}" stroke="${darken(strap, 0.3)}" stroke-width="2"/>
${mesh ? "" : stitch("M176,60 L176,170 M224,60 L224,170 M176,330 L176,440 M224,330 L224,440", lighten(strap, 0.35))}
<circle cx="200" cy="250" r="78" fill="${metal}" stroke="${darken(metal, 0.3)}" stroke-width="2"/>
<circle cx="200" cy="250" r="66" fill="${dial}"/>
${Array.from({ length: 12 }, (_, i) => {
  const angle = (i * Math.PI) / 6;
  const r1 = i % 3 === 0 ? 50 : 55;
  return `<line x1="${(200 + Math.sin(angle) * r1).toFixed(1)}" y1="${(250 - Math.cos(angle) * r1).toFixed(1)}" x2="${(200 + Math.sin(angle) * 60).toFixed(1)}" y2="${(250 - Math.cos(angle) * 60).toFixed(1)}" stroke="#1f2937" stroke-width="${i % 3 === 0 ? 4 : 2}" stroke-linecap="round"/>`;
}).join("")}
<line x1="200" y1="250" x2="200" y2="206" stroke="#1f2937" stroke-width="5" stroke-linecap="round"/>
<line x1="200" y1="250" x2="234" y2="268" stroke="#1f2937" stroke-width="4" stroke-linecap="round"/>
<line x1="200" y1="250" x2="176" y2="292" stroke="#dc2626" stroke-width="1.6"/>
<circle cx="200" cy="250" r="5" fill="${metal}"/>
<rect x="276" y="242" width="12" height="16" rx="3" fill="${metal}" stroke="${darken(metal, 0.3)}" stroke-width="1.5"/>`,
    mesh ? patterns.mesh("mesh", strap) : ""),

  backpack: ({ color, bg }) => {
    const detail = darken(color, 0.3);
    return svg(bg || lighten(color, 0.82), `
${shadow(452, 120)}
<path d="M176,92 Q200,60 224,92" fill="none" stroke="${darken(color, 0.25)}" stroke-width="10" stroke-linecap="round"/>
<rect x="112" y="88" width="176" height="356" rx="58" fill="${color}" stroke="${detail}" stroke-width="2"/>
<path d="M126,150 Q200,120 274,150" fill="none" stroke="${detail}" stroke-width="2"/>
${stitch("M128,160 Q200,132 272,160", lighten(color, 0.35))}
<rect x="136" y="268" width="128" height="140" rx="28" fill="${darken(color, 0.08)}" stroke="${detail}" stroke-width="2"/>
<path d="M150,296 L250,296" stroke="${darken(color, 0.4)}" stroke-width="3"/>
<rect x="196" y="290" width="10" height="20" rx="3" fill="#9ca3af"/>
<rect x="184" y="190" width="32" height="40" rx="5" fill="#92400e"/>
<rect x="194" y="202" width="12" height="8" rx="2" fill="#d6d3d1"/>`);
  },

  tote: ({ color, bg }) => {
    const detail = darken(color, 0.3);
    return svg(bg || lighten(color, 0.78), `
${shadow(446, 140)}
${both(`<path d="M150,190 Q150,92 200,92" fill="none" stroke="${darken(color, 0.12)}" stroke-width="12" stroke-linecap="round"/>`)}
<path d="M96,190 L304,190 L328,436 L72,436 Z" fill="${color}" stroke="${detail}" stroke-width="2" stroke-linejoin="round"/>
${stitch("M104,202 L296,202 M80,424 L320,424", lighten(color, 0.4))}
<path d="M96,190 L304,190 L300,214 L100,214 Z" fill="${darken(color, 0.1)}"/>
<rect x="186" y="228" width="28" height="18" rx="3" fill="#d4af37"/>`);
  },

  sunglasses: ({ style, frame, lens, bg }) => {
    if (style === "aviator") {
      const lensShape = "M108,214 Q108,196 150,196 Q190,196 190,214 Q190,268 150,286 Q108,282 108,214 Z";
      return svg(bg || "#eef2f7", `
${shadow(330, 120)}
${both(`<path d="${lensShape}" fill="url(#lens)" stroke="${frame}" stroke-width="5"/>`)}
<path d="M190,206 Q200,198 210,206 M186,198 Q200,190 214,198" fill="none" stroke="${frame}" stroke-width="4"/>
${both(line("M108,206 L72,196", frame, 5))}
${both(`<path d="M122,212 Q134,204 150,206" stroke="#fff" stroke-width="5" fill="none" opacity="0.5" stroke-linecap="round"/>`)}`,
      `<linearGradient id="lens" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${darken(lens, 0.2)}"/><stop offset="1" stop-color="${lighten(lens, 0.25)}"/></linearGradient>`);
    }
    const lensShape = "M100,212 Q96,190 130,192 L186,200 Q194,246 168,268 Q124,282 108,252 Q100,236 100,212 Z";
    return svg(bg || "#f3f4f6", `
${shadow(330, 120)}
${both(`<path d="${lensShape}" fill="${lens}" stroke="${frame}" stroke-width="9" stroke-linejoin="round"/>`)}
${both(`<path d="M96,206 L80,188" stroke="${frame}" stroke-width="9" stroke-linecap="round"/>`)}
<path d="M186,214 Q200,202 214,214" fill="none" stroke="${frame}" stroke-width="7"/>
${both(`<path d="M118,214 Q132,204 150,206" stroke="#fff" stroke-width="5" fill="none" opacity="0.35" stroke-linecap="round"/>`)}`);
  },

  earrings: ({ metal, bg }) => svg(bg || "#f7efe2", `
${shadow(400, 110)}
${[122, 278].map((x) => `
<circle cx="${x}" cy="164" r="9" fill="${metal}" stroke="${darken(metal, 0.3)}" stroke-width="1.5"/>
<circle cx="${x}" cy="252" r="72" fill="none" stroke="${darken(metal, 0.25)}" stroke-width="14"/>
<circle cx="${x}" cy="252" r="72" fill="none" stroke="${metal}" stroke-width="9"/>
<path d="M${x - 54},206 A72 72 0 0 1 ${x - 16},182" fill="none" stroke="#fffbe6" stroke-width="4" stroke-linecap="round" opacity="0.9"/>`).join("")}`),

  scarf: ({ color, accent, highlight, bg }) => svg(bg || lighten(color, 0.8), `
${shadow(448, 120)}
<path d="M200,62 L330,200 L200,338 L70,200 Z" fill="url(#paisley)" stroke="${darken(color, 0.3)}" stroke-width="2"/>
<path d="M200,82 L310,200 L200,318 L90,200 Z" fill="none" stroke="${accent}" stroke-width="6"/>
<path d="M200,338 Q170,380 150,436 L186,440 Q196,392 214,352 Z" fill="url(#paisley)" stroke="${darken(color, 0.3)}" stroke-width="2"/>
<path d="M200,338 Q236,384 262,430 L228,440 Q212,394 194,350 Z" fill="url(#paisley)" stroke="${darken(color, 0.3)}" stroke-width="2"/>
<circle cx="200" cy="338" r="16" fill="${darken(color, 0.12)}"/>`,
    patterns.paisley("paisley", color, accent, highlight)),
};

// One entry per seeded product, in the same order as server/db/products.js
export const productImages = [
  ["slim-fit-oxford-shirt", "shirt", { color: "#f8fafc", bg: "#dbe7f3" }],
  ["checked-flannel-shirt", "shirt", { color: "#b91c1c", fill: "url(#check)" }],
  ["linen-blend-casual-shirt", "shirt", { color: "#6b7c4b" }],
  ["denim-utility-shirt", "shirt", { color: "#4a6fa5", pockets: true, stitchColor: "#d97706" }],
  ["essential-crew-neck-t-shirt", "tshirt", { color: "#374151" }],
  ["graphic-print-t-shirt", "tshirt", { color: "#f5f0e6", graphic: true, bg: "#dbeafe" }],
  ["polo-t-shirt", "tshirt", { color: "#1e3a5f", polo: true }],
  ["slim-tapered-jeans", "pants", { color: "#1f2f56", fit: "tapered" }],
  ["relaxed-fit-jeans", "pants", { color: "#8fb0d6", fit: "straight", bg: "#eef4fb" }],
  ["chino-trousers", "pants", { color: "#c8b28a", fit: "tapered", jeans: false }],
  ["cotton-kurta", "kurta", { color: "#7fb3e0" }],
  ["hooded-sweatshirt", "hoodie", { color: "#1f2937", bg: "#e5e7eb" }],
  ["bomber-jacket", "bomber", { color: "#556b2f" }],
  ["leather-belt", "belt", { color: "#6b4226" }],
  ["analog-wrist-watch", "watch", { strap: "#7c4a26", metal: "#c0c4cc", dial: "#fdfcf7", bg: "#ece4da" }],
  ["canvas-backpack", "backpack", { color: "#6b7280" }],
  ["aviator-sunglasses", "sunglasses", { style: "aviator", frame: "#c9a227", lens: "#2f4f3f" }],
  ["floral-maxi-dress", "dress", { style: "maxi", color: "#fde4ec", fill: "url(#floral)", bg: "#fbcfe8" }],
  ["wrap-midi-dress", "dress", { style: "wrap", color: "#047857" }],
  ["shift-dress", "dress", { style: "shift", color: "#d4a017" }],
  ["ruffle-sleeve-top", "top", { style: "ruffle", color: "#fbfbfb" }],
  ["striped-cotton-top", "top", { style: "stripes", color: "#1e3a8a", fill: "url(#stripes)" }],
  ["satin-blouse", "top", { style: "blouse", color: "#f2b8b8" }],
  ["high-rise-skinny-jeans", "pants", { color: "#4a78b5", fit: "skinny" }],
  ["wide-leg-jeans", "pants", { color: "#a7c4e5", fit: "wide", bg: "#f0f6fc" }],
  ["printed-anarkali-kurta", "anarkali", { color: "#8b1e3f", accent: "#e0b84c" }],
  ["straight-cotton-kurta", "kurta", { color: "#2e3a87", motif: true }],
  ["palazzo-pants", "pants", { color: "#1f2023", fit: "palazzo", jeans: false, bg: "#e7e5e4" }],
  ["knit-cardigan", "cardigan", { color: "#d6c4a8" }],
  ["denim-jacket", "jacket", { color: "#5b7fb0" }],
  ["leather-tote-bag", "tote", { color: "#b5793e" }],
  ["gold-tone-hoop-earrings", "earrings", { metal: "#d4af37" }],
  ["silk-scarf", "scarf", { color: "#0f766e", accent: "#f97316", highlight: "#fde68a" }],
  ["cat-eye-sunglasses", "sunglasses", { style: "cateye", frame: "#111827", lens: "#374151" }],
  ["rose-gold-watch", "watch", { strap: "#e2b4a0", metal: "#d9a38f", mesh: true, bg: "#f6e9e3" }],
];

fs.mkdirSync(outDir, { recursive: true });
for (const [slug, template, options] of productImages) {
  fs.writeFileSync(path.join(outDir, `${slug}.svg`), templates[template](options));
}
console.log(`Wrote ${productImages.length} images to ${path.relative(process.cwd(), outDir)}`);
