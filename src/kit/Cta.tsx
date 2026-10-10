import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts, hardShadow, radii, safeBox, springs, stroke } from "../theme";
import { useEnterExit } from "./Scene";

const Heart: React.FC<{ size: number; fill: string }> = ({ size, fill }) => (
  <svg viewBox="0 0 100 92" width={size} height={size * 0.92}>
    <path
      d="M50 88 C 20 66 4 50 4 30 C 4 14 16 4 29 4 C 39 4 46 10 50 18 C 54 10 61 4 71 4 C 84 4 96 14 96 30 C 96 50 80 66 50 88 Z"
      fill={fill}
      stroke={colors.ink}
      strokeWidth={7}
      strokeLinejoin="round"
    />
  </svg>
);

/** Carton de fin : like + abonnement + pseudo. */
export const Cta: React.FC<{
  handle?: string;
  likeText?: string;
  followText?: string;
  y?: number;
}> = ({ handle, likeText = "Like", followText = "Abonne-toi", y = safeBox.y + safeBox.height * 0.42 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { exit } = useEnterExit();
  const likeIn = spring({ frame, fps, config: springs.pop });
  const followIn = spring({ frame: frame - 10, fps, config: springs.pop });
  const handleIn = spring({ frame: frame - 18, fps, config: springs.soft });
  // Le cœur se remplit puis bat.
  const filled = frame > 22;
  const beat = filled ? 1 + Math.max(0, Math.sin((frame - 22) / 3.2)) * 0.12 * Math.exp(-(frame - 22) / 30) : 1;
  // « Clic » sur le bouton d'abonnement.
  const press = interpolate(frame, [30, 34, 40], [1, 0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subscribed = frame >= 34;

  const pill: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 24,
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 76,
    padding: "24px 48px",
    border: `${stroke.base}px solid ${colors.ink}`,
    borderRadius: radii.pill,
    boxShadow: hardShadow(12),
  };

  return (
    <div
      style={{
        position: "absolute",
        left: safeBox.x,
        width: safeBox.width,
        top: y,
        transform: "translateY(-50%)",
        opacity: exit,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 44,
      }}
    >
      <div style={{ ...pill, background: colors.white, color: colors.ink, transform: `scale(${likeIn}) rotate(-3deg)` }}>
        <div style={{ transform: `scale(${beat})` }}>
          <Heart size={84} fill={filled ? colors.signal : colors.white} />
        </div>
        {likeText}
      </div>
      <div
        style={{
          ...pill,
          background: subscribed ? colors.ink : colors.signal,
          color: colors.white,
          transform: `scale(${followIn * press}) rotate(2deg)`,
        }}
      >
        {subscribed ? "✓ Abonné" : followText}
      </div>
      {handle && (
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 48,
            color: colors.ink,
            opacity: handleIn,
            transform: `translateY(${(1 - handleIn) * 30}px)`,
          }}
        >
          {handle}
        </div>
      )}
    </div>
  );
};
