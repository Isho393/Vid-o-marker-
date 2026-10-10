import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors, durations, ease, HEIGHT, WIDTH, type ColorName } from "../theme";

export type Pattern = "grille" | "losanges" | "cercles" | "rayures" | "uni";

export type BackgroundStep = {
  /** Frame (absolue dans la composition) où la transition vers ce fond commence. */
  at: number;
  pattern: Pattern;
  /** Couleur du fond. */
  bg?: ColorName;
  /** Couleur des motifs. */
  fg?: ColorName;
};

const PatternDefs: React.FC<{ id: string; pattern: Pattern; fg: string; drift: number }> = ({
  id,
  pattern,
  fg,
  drift,
}) => {
  const size = pattern === "losanges" ? 120 : pattern === "rayures" ? 90 : 96;
  const t = `translate(${drift % size} ${(drift * 0.6) % size})`;
  return (
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse" patternTransform={t}>
      {pattern === "grille" && (
        <path d={`M ${size} 0 L 0 0 0 ${size}`} fill="none" stroke={fg} strokeWidth={4} />
      )}
      {pattern === "losanges" && (
        <path
          d={`M ${size / 2} 14 L ${size - 14} ${size / 2} L ${size / 2} ${size - 14} L 14 ${size / 2} Z`}
          fill="none"
          stroke={fg}
          strokeWidth={5}
          strokeLinejoin="round"
        />
      )}
      {pattern === "cercles" && <circle cx={size / 2} cy={size / 2} r={13} fill={fg} />}
      {pattern === "rayures" && (
        <path d={`M 0 ${size} L ${size} 0`} stroke={fg} strokeWidth={14} strokeLinecap="square" />
      )}
    </pattern>
  );
};

const Layer: React.FC<{ step: BackgroundStep; index: number; drift: number }> = ({
  step,
  index,
  drift,
}) => {
  const bg = colors[step.bg ?? "paper"];
  const fg = colors[step.fg ?? "paperDeep"];
  const id = `bg-pattern-${index}`;
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <PatternDefs id={id} pattern={step.pattern} fg={fg} drift={drift} />
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill={bg} />
      {step.pattern !== "uni" && <rect width={WIDTH} height={HEIGHT} fill={`url(#${id})`} />}
    </svg>
  );
};

/**
 * Fond à motifs qui dérive lentement. Chaque étape est révélée par un cercle
 * qui s'ouvre depuis `origin` (par défaut le centre).
 */
export const Background: React.FC<{
  steps: BackgroundStep[];
  transition?: number;
  origin?: { x: number; y: number };
  /** Pixels par frame. */
  driftSpeed?: number;
}> = ({ steps, transition = durations.bgTransition, origin, driftSpeed = 0.8 }) => {
  const frame = useCurrentFrame();
  const sorted = [...steps].sort((a, b) => a.at - b.at);
  const currentIndex = Math.max(
    0,
    sorted.findLastIndex((s) => s.at <= frame),
  );
  const ox = origin?.x ?? WIDTH / 2;
  const oy = origin?.y ?? HEIGHT / 2;
  const maxR = Math.hypot(Math.max(ox, WIDTH - ox), Math.max(oy, HEIGHT - oy));
  const drift = frame * driftSpeed;

  const current = sorted[currentIndex];
  const previous = currentIndex > 0 ? sorted[currentIndex - 1] : null;
  const progress =
    previous === null
      ? 1
      : interpolate(frame, [current.at, current.at + transition], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease.inOut,
        });

  return (
    <AbsoluteFill>
      {previous && progress < 1 && (
        <Layer step={previous} index={currentIndex - 1} drift={drift} />
      )}
      <AbsoluteFill
        style={{
          clipPath: progress < 1 ? `circle(${progress * maxR}px at ${ox}px ${oy}px)` : undefined,
        }}
      >
        <Layer step={current} index={currentIndex} drift={drift} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
