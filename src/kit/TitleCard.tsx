import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts, hardShadow, radii, safeBox, springs, stroke, type ColorName } from "../theme";
import { useEnterExit } from "./Scene";

/**
 * Titre animé lettre par lettre, posé sur un carton.
 * Les retours à la ligne explicites (\n) sont respectés ; sinon le texte se replie.
 */
export const TitleCard: React.FC<{
  text: string;
  kicker?: string;
  /** Centre vertical du carton (px). */
  y?: number;
  card?: ColorName;
  textColor?: ColorName;
  fontSize?: number;
  /** Frames entre deux lettres. */
  stagger?: number;
  rotate?: number;
}> = ({
  text,
  kicker,
  y = safeBox.y + safeBox.height * 0.3,
  card = "white",
  textColor = "ink",
  fontSize = 128,
  stagger = 1.5,
  rotate = -2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { enter, exit } = useEnterExit({ config: springs.soft });
  let letterIndex = 0;

  return (
    <div
      style={{
        position: "absolute",
        left: safeBox.x,
        width: safeBox.width,
        top: y,
        transform: `translateY(-50%) rotate(${rotate * enter}deg) scale(${interpolate(enter, [0, 1], [0.85, 1]) * interpolate(exit, [0, 1], [0.8, 1])})`,
        opacity: Math.min(1, enter * 2) * exit,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {kicker && (
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 40,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: colors.white,
            background: colors.ink,
            padding: "10px 26px",
            borderRadius: radii.pill,
            marginBottom: -22,
            zIndex: 1,
            transform: `translateY(${(1 - enter) * -30}px)`,
          }}
        >
          {kicker}
        </div>
      )}
      <div
        style={{
          background: colors[card],
          border: `${stroke.base}px solid ${colors.ink}`,
          borderRadius: radii.lg,
          boxShadow: hardShadow(16),
          padding: "48px 44px 40px",
          maxWidth: "100%",
          boxSizing: "border-box",
          textAlign: "center",
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize,
          lineHeight: 0.98,
          letterSpacing: -2,
          color: colors[textColor],
        }}
      >
        {text.split("\n").map((line, li) => (
          <div key={li}>
            {line.split(" ").map((word, wi) => (
              <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap", margin: "0 0.12em" }}>
                {[...word].map((ch, ci) => {
                  const s = spring({
                    frame: frame - 4 - letterIndex++ * stagger,
                    fps,
                    config: springs.pop,
                  });
                  return (
                    <span
                      key={ci}
                      style={{
                        display: "inline-block",
                        transform: `translateY(${(1 - s) * 60}px) scale(${s})`,
                        opacity: Math.min(1, s * 2),
                      }}
                    >
                      {ch}
                    </span>
                  );
                })}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
