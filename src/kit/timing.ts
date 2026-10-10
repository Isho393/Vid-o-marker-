import type { Caption } from "@remotion/captions";
import { FPS } from "../theme";

/** Intervalle en frames, prêt à passer à <Scene from durationInFrames>. */
export type FrameRange = { from: number; to: number; durationInFrames: number };

export const msToFrame = (ms: number, fps = FPS) => Math.round((ms / 1000) * fps);
export const frameToMs = (frame: number, fps = FPS) => (frame / fps) * 1000;
export const secToFrame = (s: number, fps = FPS) => Math.round(s * fps);

/** Minuscules, sans accents ni ponctuation : « Éh, bien ! » → « eh bien ». */
export const normalizeWord = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}' -]/gu, "")
    .replace(/['’]/g, "'")
    .trim();

/** Égalité tolérante aux élisions : « avatar » trouve « L'avatar ». */
export const sameWord = (spoken: string, target: string) => {
  const a = normalizeWord(spoken);
  const b = normalizeWord(target);
  return a === b || a.endsWith(`'${b}`);
};

const tokenize = (phrase: string) =>
  phrase.split(/\s+/).map(normalizeWord).filter(Boolean);

type FindOptions = {
  /** 1 = première occurrence (défaut). */
  occurrence?: number;
  /** Ne cherche qu'après ce temps (ms). */
  afterMs?: number;
  fps?: number;
};

/**
 * Index (dans captions) du premier mot de la phrase cherchée.
 * Lève une erreur explicite si introuvable : mieux vaut casser dans le Studio
 * qu'une animation silencieusement décalée.
 */
export const findPhraseIndex = (
  captions: Caption[],
  phrase: string,
  { occurrence = 1, afterMs = 0 }: FindOptions = {},
): { start: number; end: number } => {
  const target = tokenize(phrase);
  if (target.length === 0) throw new Error(`timing: phrase vide`);
  let seen = 0;
  for (let i = 0; i <= captions.length - target.length; i++) {
    if (captions[i].startMs < afterMs) continue;
    if (target.every((t, k) => sameWord(captions[i + k].text, t))) {
      seen++;
      if (seen === occurrence) return { start: i, end: i + target.length - 1 };
    }
  }
  throw new Error(
    `timing: « ${phrase} » (occurrence ${occurrence}) introuvable dans la transcription`,
  );
};

/** Frames de début et de fin d'un mot ou d'une phrase de la transcription. */
export const phraseRange = (
  captions: Caption[],
  phrase: string,
  opts: FindOptions = {},
): FrameRange => {
  const fps = opts.fps ?? FPS;
  const { start, end } = findPhraseIndex(captions, phrase, opts);
  const from = msToFrame(captions[start].startMs, fps);
  const to = Math.max(from + 1, msToFrame(captions[end].endMs, fps));
  return { from, to, durationInFrames: to - from };
};

/** Frame où le mot (ou la phrase) commence à être prononcé. */
export const wordFrame = (captions: Caption[], phrase: string, opts: FindOptions = {}) =>
  phraseRange(captions, phrase, opts).from;

/**
 * Intervalle allant d'un mot déclencheur jusqu'au mot déclencheur suivant
 * (ou jusqu'à `endFrame`). Pratique pour enchaîner des scènes sans trou.
 */
export const between = (
  captions: Caption[],
  fromPhrase: string,
  toPhrase: string | number,
  opts: FindOptions = {},
): FrameRange => {
  const from = wordFrame(captions, fromPhrase, opts);
  const to =
    typeof toPhrase === "number"
      ? toPhrase
      : wordFrame(captions, toPhrase, { ...opts, afterMs: frameToMs(from, opts.fps) });
  return { from, to, durationInFrames: Math.max(1, to - from) };
};

/** Durée totale (frames) couverte par la transcription, avec une marge de fin. */
export const transcriptDuration = (captions: Caption[], tailSec = 1.5, fps = FPS) =>
  msToFrame(captions[captions.length - 1]?.endMs ?? 0, fps) + secToFrame(tailSec, fps);
