import React from "react";
import {
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { durations, ease, springs } from "../theme";
import type { FrameRange } from "./timing";

type SceneProps = {
  children: React.ReactNode;
  /** Soit from + durationInFrames, soit un range issu de timing.ts. */
  from?: number;
  durationInFrames?: number;
  range?: FrameRange;
  name?: string;
  /** Plein cadre (défaut) ou sans conteneur pour superposer librement. */
  layout?: "absolute-fill" | "none";
};

/**
 * Une séquence nommée. Dans les enfants, useCurrentFrame() repart de 0
 * au début de la scène.
 */
export const Scene: React.FC<SceneProps> = ({
  children,
  from,
  durationInFrames,
  range,
  name,
  layout = "absolute-fill",
}) => {
  const start = range?.from ?? from ?? 0;
  const duration = range?.durationInFrames ?? durationInFrames ?? Infinity;
  return (
    <Sequence from={start} durationInFrames={duration} name={name} layout={layout}>
      {children}
    </Sequence>
  );
};

/**
 * Progression d'entrée (0→1, ressort) et de sortie (1→0) relative à la scène courante.
 * `visible` multiplie les deux : à utiliser pour opacité et échelle.
 */
export const useEnterExit = ({
  enterDelay = 0,
  exitDuration = durations.exit,
  config = springs.pop,
}: {
  enterDelay?: number;
  exitDuration?: number;
  config?: { damping?: number; stiffness?: number; mass?: number };
} = {}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ frame: frame - enterDelay, fps, config });
  const exit =
    Number.isFinite(durationInFrames) && durationInFrames < 100000
      ? interpolate(
          frame,
          [durationInFrames - exitDuration, durationInFrames],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.in },
        )
      : 1;
  return { enter, exit, visible: enter * exit, frame };
};
