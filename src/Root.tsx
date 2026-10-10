import React from "react";
import { Composition } from "remotion";
import { Demo, DEMO_DURATION } from "./demo/Demo";
import { FPS, HEIGHT, WIDTH } from "./theme";

// Une <Composition> par vidéo. /composer ajoute les nouvelles entrées ci-dessous.
// id = slug de la vidéo (lettres, chiffres, tirets).

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="demo"
        component={Demo}
        durationInFrames={DEMO_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ showSafeZones: false }}
      />
    </>
  );
};
