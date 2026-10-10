import React from "react";
import { getStaticFiles, Img, interpolate, useCurrentFrame } from "remotion";
import { colors, fonts, springs } from "../theme";
import { useEnterExit } from "./Scene";

/**
 * Poses connues des silhouettes provisoires. Les vraies poses sont les PNG
 * transparents de assets/avatar/ : le nom de fichier (sans extension) est le nom de la pose.
 */
export const PLACEHOLDER_POSES = [
  "neutre",
  "sourire",
  "fache",
  "surpris",
  "pointe",
  "reflechit",
] as const;

export type PoseName = (typeof PLACEHOLDER_POSES)[number] | (string & {});

/** Poses réellement fournies (fichiers dans assets/avatar/). */
export const availablePoses = (): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const f of getStaticFiles()) {
    const m = f.name.match(/^avatar\/([^/]+)\.(png|webp)$/i);
    if (m) out[m[1]] = f.src;
  }
  return out;
};

type Entrance = "pop" | "slide-up" | "slide-left" | "slide-right" | "swap";

type AvatarProps = {
  pose: PoseName;
  /** Centre horizontal / bas du personnage, en px. */
  x?: number;
  y?: number;
  /** Hauteur affichée en px. */
  height?: number;
  entrance?: Entrance;
  enterDelay?: number;
  flip?: boolean;
  /** Épaisseur du contour sticker blanc. */
  outline?: number;
};

const stickerFilter = (w: number) =>
  [
    `drop-shadow(${w}px 0 0 ${colors.white})`,
    `drop-shadow(-${w}px 0 0 ${colors.white})`,
    `drop-shadow(0 ${w}px 0 ${colors.white})`,
    `drop-shadow(0 -${w}px 0 ${colors.white})`,
    `drop-shadow(12px 14px 0 ${colors.ink})`,
  ].join(" ");

/**
 * Avatar en sticker : pose par nom, entrée animée, légère respiration.
 * Pour changer de pose, placer un <Avatar> par <Scene> (entrance="swap" pour
 * un enchaînement sans ressortir du cadre).
 */
export const Avatar: React.FC<AvatarProps> = ({
  pose,
  x = 540,
  y = 1090,
  height = 680,
  entrance = "pop",
  enterDelay = 0,
  flip = false,
  outline = 10,
}) => {
  const frame = useCurrentFrame();
  const { enter, exit } = useEnterExit({
    enterDelay,
    config: entrance === "swap" ? springs.snappy : springs.pop,
  });
  const breathe = 1 + Math.sin(frame / 14) * 0.012;

  let tx = 0;
  let ty = 0;
  let scale = 1;
  let rotate = 0;
  switch (entrance) {
    case "pop":
      scale = interpolate(enter, [0, 1], [0.3, 1]);
      rotate = interpolate(enter, [0, 1], [-12, 0]);
      break;
    case "slide-up":
      ty = interpolate(enter, [0, 1], [height, 0]);
      break;
    case "slide-left":
      tx = interpolate(enter, [0, 1], [900, 0]);
      break;
    case "slide-right":
      tx = interpolate(enter, [0, 1], [-900, 0]);
      break;
    case "swap": {
      // Petit écrasement-rebond : la pose change sans sortir du cadre.
      const squash = interpolate(enter, [0, 0.5, 1], [0.9, 1.05, 1]);
      scale = squash;
      break;
    }
  }
  scale *= interpolate(exit, [0, 1], [0.6, 1]);

  const src = availablePoses()[pose];

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        height,
        transform: `translate(-50%, -100%) translate(${tx}px, ${ty}px) rotate(${rotate}deg) scale(${scale * breathe}) scaleX(${flip ? -1 : 1})`,
        transformOrigin: "50% 100%",
        opacity: Math.min(1, enter * 3) * exit,
        filter: stickerFilter(outline),
      }}
    >
      {src ? (
        <Img src={src} style={{ height, width: "auto", display: "block" }} />
      ) : (
        <PlaceholderFigure pose={pose} height={height} />
      )}
    </div>
  );
};

/** Silhouette PROVISOIRE, en attendant les vraies poses. */
const PlaceholderFigure: React.FC<{ pose: PoseName; height: number }> = ({ pose, height }) => {
  const w = height * 0.62;
  const face = {
    neutre: { mouth: "M 80 128 L 120 128", brows: 0, eyes: 7 },
    sourire: { mouth: "M 74 120 Q 100 150 126 120", brows: -4, eyes: 7 },
    fache: { mouth: "M 78 135 Q 100 118 122 135", brows: 10, eyes: 6 },
    surpris: { mouth: "M 100 122 m -12 0 a 12 15 0 1 0 24 0 a 12 15 0 1 0 -24 0", brows: -10, eyes: 9 },
    pointe: { mouth: "M 78 122 Q 100 142 122 122", brows: -2, eyes: 7 },
    reflechit: { mouth: "M 84 130 Q 100 124 118 132", brows: 4, eyes: 6 },
  }[pose as (typeof PLACEHOLDER_POSES)[number]] ?? { mouth: "M 80 128 L 120 128", brows: 0, eyes: 7 };

  return (
    <svg viewBox="0 0 200 320" width={w} height={height} style={{ display: "block", overflow: "visible" }}>
      {/* corps */}
      <rect x={30} y={170} width={140} height={150} rx={60} fill={colors.lilac} stroke={colors.ink} strokeWidth={6} />
      {/* bras */}
      {pose === "pointe" ? (
        <path d="M 160 210 L 205 150" stroke={colors.ink} strokeWidth={20} strokeLinecap="round" />
      ) : pose === "reflechit" ? (
        <path d="M 150 230 Q 150 175 118 150" stroke={colors.ink} strokeWidth={18} strokeLinecap="round" fill="none" />
      ) : null}
      {/* tête */}
      <circle cx={100} cy={100} r={72} fill={colors.sun} stroke={colors.ink} strokeWidth={6} />
      {/* yeux et sourcils */}
      <circle cx={76} cy={96} r={face.eyes} fill={colors.ink} />
      <circle cx={124} cy={96} r={face.eyes} fill={colors.ink} />
      <path d={`M 62 ${78 - face.brows / 2} L 90 ${78 + face.brows / 2}`} stroke={colors.ink} strokeWidth={6} strokeLinecap="round" />
      <path d={`M 110 ${78 + face.brows / 2} L 138 ${78 - face.brows / 2}`} stroke={colors.ink} strokeWidth={6} strokeLinecap="round" />
      <path d={face.mouth} stroke={colors.ink} strokeWidth={6} fill={pose === "surpris" ? colors.ink : "none"} strokeLinecap="round" />
      {/* étiquette provisoire */}
      <g transform="translate(100 268) rotate(-6)">
        <rect x={-78} y={-22} width={156} height={44} rx={8} fill={colors.white} stroke={colors.ink} strokeWidth={4} />
        <text textAnchor="middle" y={9} fontFamily={fonts.display} fontWeight={800} fontSize={24} fill={colors.signal}>
          PROVISOIRE
        </text>
      </g>
      <text x={100} y={214} textAnchor="middle" fontFamily={fonts.body} fontWeight={700} fontSize={16} fill={colors.ink}>
        {pose}
      </text>
    </svg>
  );
};
