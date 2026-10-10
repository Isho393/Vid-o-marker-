import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";

/**
 * Polices embarquées dans assets/fonts/ (variables, OFL) : rendu hors ligne et déterministe.
 * Titres : Bricolage Grotesque. Texte : DM Sans.
 */
const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const LATIN_EXT =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF";

for (const [family, file] of [
  ["Bricolage Grotesque", "bricolage"],
  ["DM Sans", "dmsans"],
] as const) {
  for (const [subset, range] of [
    ["latin", LATIN],
    ["latin-ext", LATIN_EXT],
  ] as const) {
    loadFont({
      family,
      url: staticFile(`fonts/${file}-${subset}.woff2`),
      weight: "200 800",
      unicodeRange: range,
    });
  }
}

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const colors = {
  paper: "#FFF3DF",
  paperDeep: "#F6E2C0",
  ink: "#17142B",
  signal: "#FF4F2E", // accent principal (mot accentué, CTA)
  mint: "#1FC7A6",
  sun: "#FFC53D",
  lilac: "#8C7BFF",
  sky: "#5BC0FF",
  white: "#FFFFFF",
} as const;

export type ColorName = keyof typeof colors;

export const fonts = {
  display: "'Bricolage Grotesque', sans-serif",
  body: "'DM Sans', sans-serif",
} as const;

export const radii = { sm: 18, md: 32, lg: 56, pill: 999 } as const;

export const stroke = { thin: 5, base: 8, thick: 12 } as const;

/** Ombre dure décalée, signature du style. */
export const hardShadow = (offset = 14, color: string = colors.ink) =>
  `${offset}px ${offset}px 0 ${color}`;

/**
 * Zones de sécurité 1080×1920 (interface TikTok / Reels / Shorts).
 * Rien d'important hors du rectangle intérieur.
 */
export const safe = {
  top: 220,
  bottom: 460,
  left: 70,
  right: 150,
} as const;

export const safeBox = {
  x: safe.left,
  y: safe.top,
  width: WIDTH - safe.left - safe.right,
  height: HEIGHT - safe.top - safe.bottom,
};

/** Courbes et ressorts partagés. */
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
} as const;

export const springs = {
  pop: { damping: 12, stiffness: 180, mass: 0.6 },
  soft: { damping: 20, stiffness: 120, mass: 1 },
  snappy: { damping: 200, stiffness: 300, mass: 0.5 },
} as const;

/** Durées standard en frames. */
export const durations = {
  enter: 12,
  exit: 8,
  bgTransition: 18,
} as const;
