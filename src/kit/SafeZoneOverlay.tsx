import React from "react";
import { AbsoluteFill } from "remotion";
import { HEIGHT, safe, WIDTH } from "../theme";

/**
 * Hachure les zones masquées par l'interface des plateformes.
 * Activé par la prop `showSafeZones` des compositions (Studio ou `--props`), jamais dans le rendu final.
 */
export const SafeZoneOverlay: React.FC = () => {
  const zone: React.CSSProperties = {
    position: "absolute",
    background: "repeating-linear-gradient(45deg, rgba(255,0,80,.28) 0 18px, rgba(255,0,80,.12) 18px 36px)",
    outline: "3px dashed rgba(255,0,80,.9)",
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ ...zone, left: 0, top: 0, width: WIDTH, height: safe.top }} />
      <div style={{ ...zone, left: 0, top: HEIGHT - safe.bottom, width: WIDTH, height: safe.bottom }} />
      <div style={{ ...zone, left: WIDTH - safe.right, top: safe.top, width: safe.right, height: HEIGHT - safe.top - safe.bottom }} />
      <div style={{ ...zone, left: 0, top: safe.top, width: safe.left, height: HEIGHT - safe.top - safe.bottom }} />
    </AbsoluteFill>
  );
};
