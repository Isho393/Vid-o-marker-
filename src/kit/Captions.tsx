import React, { useMemo } from "react";
import type { Caption } from "@remotion/captions";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts, hardShadow, HEIGHT, radii, safe, springs, WIDTH } from "../theme";
import { normalizeWord, sameWord } from "./timing";

export type CaptionPage = {
  startMs: number;
  endMs: number;
  words: Caption[];
  /** Index (dans words) du mot accentué. */
  emphasis: number;
};

export type PaginateOptions = {
  maxWords?: number;
  maxChars?: number;
  /** Silence (ms) au-delà duquel on change de segment. */
  pauseBreakMs?: number;
  /** Durée max d'affichage d'un segment après son dernier mot (ms). */
  holdMs?: number;
  /**
   * Mots à accentuer en priorité. « mot » = toutes les occurrences,
   * « mot#2 » = seulement la 2e occurrence dans la transcription.
   */
  emphasize?: string[];
};

const STOPWORDS = new Set(
  (
    "le la les un une des de du d l au aux et ou mais donc or ni car que qui quoi " +
    "je tu il elle on nous vous ils elles me te se lui leur y en ce cet cette ces " +
    "mon ma mes ton ta tes son sa ses notre votre nos vos est sont suis es être " +
    "a ai as avez ont avoir pas ne plus très tout tous toute bien alors c j n s qu " +
    "dans sur sous avec pour par sans chez comme si fait faire va vais ca ici la"
  ).split(" "),
);

const parseEmphasis = (list: string[]) =>
  list.map((entry) => {
    const [word, occ] = entry.split("#");
    return { word: normalizeWord(word), occurrence: occ ? Number(occ) : null };
  });

/** Rattache la ponctuation isolée (« ! », « ? ») au mot précédent. */
const mergePunctuation = (captions: Caption[]): Caption[] => {
  const out: Caption[] = [];
  for (const c of captions) {
    const prev = out[out.length - 1];
    if (prev && /^\s*[\p{P}]+\s*$/u.test(c.text)) {
      out[out.length - 1] = { ...prev, text: prev.text + c.text.trim(), endMs: c.endMs };
    } else {
      out.push(c);
    }
  }
  return out;
};

/** Texte affiché : sans la ponctuation faible de fin (. , ; :). */
const displayText = (text: string) => text.trim().replace(/[.,;:]+$/u, "");

/** Découpe la transcription en courts segments et choisit un mot accentué par segment. */
export const paginate = (
  rawCaptions: Caption[],
  {
    maxWords = 3,
    maxChars = 20,
    pauseBreakMs = 350,
    holdMs = 600,
    emphasize = [],
  }: PaginateOptions = {},
): CaptionPage[] => {
  const captions = mergePunctuation(rawCaptions);
  const forced = parseEmphasis(emphasize);
  const occurrences = new Map<string, number>();
  const occurrenceOf = captions.map((c) => {
    const w = normalizeWord(c.text);
    const n = (occurrences.get(w) ?? 0) + 1;
    occurrences.set(w, n);
    return n;
  });

  const groups: number[][] = [];
  let current: number[] = [];
  captions.forEach((c, i) => {
    const chars = current.reduce((n, k) => n + captions[k].text.trim().length + 1, 0);
    const prev = current.length ? captions[current[current.length - 1]] : null;
    const pause = prev ? c.startMs - prev.endMs : 0;
    const endsSentence = prev ? /[.!?…:]$/.test(prev.text.trim()) : false;
    if (
      current.length > 0 &&
      (current.length >= maxWords ||
        chars + c.text.trim().length > maxChars ||
        pause > pauseBreakMs ||
        endsSentence ||
        prev?.pageBreakAfter)
    ) {
      groups.push(current);
      current = [];
    }
    current.push(i);
  });
  if (current.length) groups.push(current);

  return groups.map((idx, g) => {
    const words = idx.map((i) => captions[i]);
    const forcedPos = idx.findIndex((i) =>
      forced.some(
        (f) =>
          sameWord(captions[i].text, f.word) &&
          (f.occurrence === null || f.occurrence === occurrenceOf[i]),
      ),
    );
    let emphasis = forcedPos;
    if (emphasis < 0) {
      let best = -1;
      words.forEach((w, k) => {
        const n = normalizeWord(w.text);
        // « c'est », « l'outil » : on juge le mot sans son élision.
        const core = n.replace(/^[a-z]{1,3}'/, "");
        const score = (STOPWORDS.has(n) || STOPWORDS.has(core) ? 0 : 100) + core.length;
        if (best < 0 || score > best) {
          best = score;
          emphasis = k;
        }
      });
    }
    const nextStart = groups[g + 1] ? captions[groups[g + 1][0]].startMs : Infinity;
    const lastEnd = words[words.length - 1].endMs;
    return {
      startMs: words[0].startMs,
      endMs: Math.min(nextStart, lastEnd + holdMs),
      words,
      emphasis,
    };
  });
};

const Word: React.FC<{
  word: Caption;
  emphasized: boolean;
  timeMs: number;
}> = ({ word, emphasized, timeMs }) => {
  const { fps } = useVideoConfig();
  const spokenFrame = ((timeMs - word.startMs) / 1000) * fps;
  const pop = spring({ frame: spokenFrame, fps, config: springs.pop });
  const visible = timeMs >= word.startMs;
  const text = displayText(word.text);

  const base: React.CSSProperties = {
    display: "inline-block",
    margin: "0 12px",
    opacity: visible ? 1 : 0,
    transform: `scale(${visible ? 0.6 + 0.4 * pop : 0.6}) translateY(${(1 - pop) * 20}px)`,
    fontFamily: fonts.display,
    fontWeight: 800,
    lineHeight: 1.05,
    whiteSpace: "nowrap",
  };

  if (emphasized) {
    return (
      <span
        style={{
          ...base,
          color: colors.white,
          background: colors.signal,
          padding: "4px 22px 10px",
          borderRadius: radii.sm,
          border: `6px solid ${colors.ink}`,
          boxShadow: hardShadow(8),
          transform: `${base.transform} rotate(-2.5deg)`,
        }}
      >
        {text}
      </span>
    );
  }
  return (
    <span
      style={{
        ...base,
        color: colors.white,
        WebkitTextStroke: `14px ${colors.ink}`,
        paintOrder: "stroke fill",
        textShadow: `6px 7px 0 ${colors.ink}`,
      }}
    >
      {text}
    </span>
  );
};

/**
 * Sous-titres mot à mot. Les mots apparaissent au moment où ils sont prononcés,
 * un mot par segment est accentué (forçable via `emphasize`).
 * Positionnés juste au-dessus de la zone masquée du bas.
 */
export const Captions: React.FC<
  {
    captions: Caption[];
    fontSize?: number;
    /** Position verticale du bas du bloc (px depuis le haut). */
    bottom?: number;
  } & PaginateOptions
> = ({ captions, fontSize = 92, bottom = HEIGHT - safe.bottom - 40, ...opts }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pages = useMemo(
    () => paginate(captions, opts),
    [captions, JSON.stringify(opts)],
  );
  const timeMs = (frame / fps) * 1000;
  const page = pages.find((p) => timeMs >= p.startMs && timeMs < p.endMs);
  if (!page) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: safe.left,
          width: WIDTH - safe.left - safe.right,
          top: 0,
          height: bottom,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize,
            textAlign: "center",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            rowGap: 18,
          }}
        >
          {page.words.map((w, i) => (
            <Word
              key={`${w.startMs}-${i}`}
              word={w}
              emphasized={i === page.emphasis}
              timeMs={timeMs}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
