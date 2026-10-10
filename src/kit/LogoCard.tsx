import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts, hardShadow, radii, safeBox, springs, stroke, type ColorName } from "../theme";
import { useEnterExit } from "./Scene";

/**
 * Logo dans un cadre + nom + étiquette (ex. « outil cité »).
 * `logo` : chemin relatif à assets/ (ex. "logos/figma.svg"). Sans logo, les initiales du nom.
 */
export const LogoCard: React.FC<{
  name: string;
  label?: string;
  logo?: string;
  frameColor?: ColorName;
  y?: number;
  size?: number;
}> = ({ name, label, logo, frameColor = "mint", y = safeBox.y + safeBox.height * 0.32, size = 380 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { enter, exit } = useEnterExit();
  const nameIn = spring({ frame: frame - 8, fps, config: springs.soft });
  const labelIn = spring({ frame: frame - 14, fps, config: springs.pop });
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        position: "absolute",
        left: safeBox.x,
        width: safeBox.width,
        top: y,
        transform: `translateY(-50%) scale(${interpolate(exit, [0, 1], [0.8, 1])})`,
        opacity: exit,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 34,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          background: colors[frameColor],
          border: `${stroke.thick}px solid ${colors.ink}`,
          borderRadius: radii.lg,
          boxShadow: hardShadow(18),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${enter}) rotate(${interpolate(enter, [0, 1], [20, 3])}deg)`,
        }}
      >
        <div
          style={{
            width: size * 0.68,
            height: size * 0.68,
            background: colors.white,
            border: `${stroke.base}px solid ${colors.ink}`,
            borderRadius: radii.md,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {logo ? (
            <Img src={staticFile(logo)} style={{ width: "78%", height: "78%", objectFit: "contain" }} />
          ) : (
            <span style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: size * 0.3, color: colors.ink }}>
              {initials}
            </span>
          )}
        </div>
      </div>
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: 96,
          color: colors.ink,
          textAlign: "center",
          lineHeight: 1,
          opacity: nameIn,
          transform: `translateY(${(1 - nameIn) * 40}px)`,
        }}
      >
        {name}
      </div>
      {label && (
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 40,
            textTransform: "uppercase",
            letterSpacing: 3,
            color: colors.ink,
            background: colors.sun,
            border: `${stroke.thin}px solid ${colors.ink}`,
            borderRadius: radii.pill,
            padding: "10px 30px",
            transform: `scale(${labelIn}) rotate(-3deg)`,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
