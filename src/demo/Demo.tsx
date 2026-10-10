import React from "react";
import type { Caption } from "@remotion/captions";
import { AbsoluteFill } from "remotion";
import {
  Avatar,
  Background,
  Captions,
  Cta,
  LogoCard,
  SafeZoneOverlay,
  Scene,
  TitleCard,
  between,
  phraseRange,
  wordFrame,
} from "../kit";
import { secToFrame } from "../kit/timing";

/**
 * Transcription factice (pas d'audio en phase 1) : les mots s'enchaînent
 * à un rythme de parole réaliste, avec des pauses entre les phrases.
 */
const SCRIPT = [
  { at: 2.2, text: "Ici tout est du code." },
  { at: 4.0, text: "L'avatar change de pose selon ce que je dis." },
  { at: 7.0, text: "Et quand je cite un outil, son logo apparaît." },
  { at: 10.0, text: "Le fond se transforme à chaque idée." },
  { at: 12.4, text: "Ça m'énerve quand c'est lent, alors on accélère." },
  { at: 15.0, text: "Like et abonne-toi !" },
];

const fakeCaptions = (): Caption[] => {
  const out: Caption[] = [];
  for (const sentence of SCRIPT) {
    let t = sentence.at * 1000;
    for (const word of sentence.text.split(" ")) {
      const dur = 140 + word.length * 32;
      out.push({ text: ` ${word}`, startMs: t, endMs: t + dur, timestampMs: t + dur / 2, confidence: 1 });
      t += dur + 40;
    }
  }
  return out;
};

const captions = fakeCaptions();

export const DEMO_DURATION = secToFrame(18);

export const Demo: React.FC<{ showSafeZones?: boolean }> = ({ showSafeZones = false }) => {
  const pose = (w: string, next: string | number) => between(captions, w, next);
  const logo = between(captions, "outil", "fond");
  const bgShift = wordFrame(captions, "fond");
  const angry = wordFrame(captions, "énerve");
  const cta = phraseRange(captions, "like");

  return (
    <AbsoluteFill>
      <Background
        steps={[
          { at: 0, pattern: "grille", bg: "paper", fg: "paperDeep" },
          { at: logo.from, pattern: "losanges", bg: "sky", fg: "white" },
          { at: bgShift, pattern: "cercles", bg: "sun", fg: "paper" },
          { at: angry, pattern: "rayures", bg: "lilac", fg: "ink" },
          { at: cta.from, pattern: "grille", bg: "mint", fg: "paper" },
        ]}
      />

      <Scene name="Titre" from={0} durationInFrames={secToFrame(3.6)}>
        <TitleCard kicker="Démo du kit" text={"Monter\nsans logiciel"} card="white" />
      </Scene>

      <Scene name="Avatar neutre" range={pose("avatar", "pose")}>
        <Avatar pose="neutre" entrance="slide-up" />
      </Scene>
      <Scene name="Avatar sourire" range={pose("pose", "outil")}>
        <Avatar pose="sourire" entrance="swap" />
      </Scene>

      <Scene name="Logo" range={logo}>
        <LogoCard name="Remotion" label="Outil cité" frameColor="signal" />
      </Scene>

      <Scene name="Avatar pointe" range={pose("fond", "énerve")}>
        <Avatar pose="pointe" entrance="slide-left" />
      </Scene>
      <Scene name="Avatar fâché" range={pose("énerve", "accélère")}>
        <Avatar pose="fache" entrance="swap" />
      </Scene>
      <Scene name="Avatar surpris" range={pose("accélère", cta.from)}>
        <Avatar pose="surpris" entrance="swap" />
      </Scene>

      <Scene name="CTA" from={cta.from}>
        <Cta handle="@ton.pseudo" />
      </Scene>

      <Captions captions={captions} emphasize={["code", "pose", "logo", "accélère"]} />

      {showSafeZones && <SafeZoneOverlay />}
    </AbsoluteFill>
  );
};
