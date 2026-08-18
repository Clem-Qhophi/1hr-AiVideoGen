// Thumbnail — code-rendered YouTube thumbnails (the FREE path; no Gemini image billing).
//
// REWRITTEN 2026-08-03 after a real failure: the pipeline shipped 3 dark text-on-gradient cards for
// re-closing-costs and the channel owner said he would scroll past them. The old default (`word`)
// made the WRONG thing easy — a near-black card with soft-shadowed white text. Nothing on the browse
// wall looks like that and wins.
//
// What the winners in this repo's own outlier data (docs/research/*-viral.json, multipliers 3.5x-34x)
// actually have in common — verified by downloading and looking at them:
//   1. A REAL PHOTOGRAPH fills the whole frame. Not one used a gradient card.
//   2. 2-4 ALL-CAPS words in a heavy condensed face (Anton/Impact class).
//   3. White text with a THICK BLACK OUTLINE (not a soft shadow) — that stroke is what survives a
//      phone-sized thumbnail over a busy photo. This is the single biggest miss in the old version.
//   4. Two-tone text: line 1 white, line 2 in one saturated accent (yellow/red).
//   5. Text in the upper-left, subject on the right.
//   6. ONE chunky arrow or circle pointing at the thing that matters.
//   7. A small 1-2 word corner badge ("ILLEGAL", "INSANE!").
//   8. Saturated and bright. Never dark and muted.
// vidIQ's 2026 study of 500 breakout videos lines up: 89% used a face OR high contrast, median 5
// words of text, 1-2 directional cues max. We have no face on these channels, so HIGH CONTRAST IS
// THE SUBSTITUTE — it is not optional, it is the whole job.
//
// This is the opposite of the calm in-video brand ON PURPOSE (see
// .claude/skills/packaging/references/thumbnail-generation.md, "loud-vs-calm rule").
// Rendered as a still at 1280x720, scale 2 -> 2560x1440 (YouTube ideal).
//
// Crash-safe per vidtsx rules: static (no useState/useEffect/frame animation), no @remotion/paths or
// chroma-js. Plain inline <svg> is fine. The hook face is Anton with a heavy system fallback stack so
// a flaky Google-font load degrades to a bold render instead of crashing the most important asset.
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { loadFont as loadHook } from '@remotion/google-fonts/Anton';
import { loadFont as loadUi } from '@remotion/google-fonts/Inter';
import { COLORS, RADIUS, BRAND } from '../brand';

const HOOK = loadHook('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily;
const HOOK_STACK = `${HOOK}, 'Arial Black', 'Impact', system-ui, sans-serif`;
// Loaded here (not fonts.ts) so the thumbnail owns its own heavy weights without changing the
// in-video brand's font payload. fonts.ts only ships Inter 400/500/600, so the old kicker's
// fontWeight:800 was rendering as faux-bold.
const UI = loadUi('normal', { weights: ['700', '800', '900'], subsets: ['latin'] }).fontFamily;
const UI_STACK = `${UI}, 'Helvetica Neue', Arial, system-ui, sans-serif`;

// Two palettes. The brand names stay for backwards compatibility but they are CALM colors chosen for
// the inside of a video — on a browse wall they read muted, which is exactly how we got here. The
// thumbnail palette below is deliberately louder and avoids YouTube's own red/white/black chrome
// (vidIQ 2026: use oranges, teals, yellows, purples so the frame does not blend into the UI).
const ACCENTS: Record<string, string> = {
  // thumbnail-only LOUD palette — prefer these
  pop: '#FFD400',      // electric yellow — the default; highest luminance contrast on a dark scrim
  lime: '#B6FF3C',
  cyan: '#12E0FF',
  orange: '#FF7A18',
  hot: '#FF2D6F',
  violet: '#B14BFF',
  mint: '#1FE9A4',
  red: '#FF3B30',
  // brand tokens (muted — kept so old sidecars still render)
  accent: COLORS.accent, accent2: COLORS.accent2, signal: COLORS.signal,
  warn: COLORS.warn, danger: COLORS.danger,
};

export type ThumbnailProps = {
  headline: string;              // the giant hook — 1-3 words, ALL CAPS. In `versus` this is the top band.
  emphasis?: string;             // second line, rendered in the accent color (the two-tone device)
  kicker?: string;               // small eyebrow pill above the headline
  sub?: string;                  // small support line under the hook
  badge?: string;                // 1-3 word corner badge, opposite the text column
  accent?: string;               // palette name (pop|lime|cyan|orange|hot|violet|mint|red|brand names) or hex
  variant?: 'photo' | 'versus' | 'bleed' | 'split' | 'word';
  image?: string;                // media/-relative path for staticFile
  image2?: string;               // right-hand photo for `versus`
  labelA?: string; labelB?: string;   // versus captions (small pills)
  valueA?: string; valueB?: string;   // versus giant numbers
  arrow?: 'left' | 'right' | 'up' | 'down' | 'downleft' | 'downright' | 'upleft' | 'upright';
  arrowAt?: number[];            // [x%, y%] of frame — where the arrow TIP lands
  circleAt?: number[];           // [x%, y%, w%, h%] — hand-drawn ellipse callout
  align?: 'left' | 'right';      // which side the text column sits on (default left)
  pos?: 'top' | 'center' | 'bottom';
  focus?: string;                // objectPosition for the photo, e.g. "50% 30%"
  punch?: number;                // photo saturation/contrast multiplier (default 1 = the tuned boost)
  wordmark?: boolean;
  face?: string;                 // media/-relative path to the channel host's photo — a circular cutout
                                  // bug, per vidIQ's "89% of breakouts used a face" finding. Pair with
                                  // `arrow`/`arrowAt` pointed FROM near the face AT the subject, so the
                                  // host visually reads as directing attention to the thing in-frame —
                                  // the reaction-plus-point convention, not just a static portrait.
  faceAt?: number[];             // [x%, y%, size%] center + diameter as % of frame height (default
                                  // bottom-left, 30% — clear of the text column and the opposite badge)
  faceFocus?: string;            // objectPosition for the face crop, e.g. "50% 20%" to bias toward eyes
  faceCutout?: boolean;          // true = `face` is an already background-removed transparent PNG —
                                  // render it LARGE and un-circled, sitting directly in the scene like
                                  // a real host would (this is the actual @EliasYoderAmish composition:
                                  // he's not a small corner bug, he's a large integrated presence).
                                  // false/unset = the small circular FaceBadge bug (photo has a real bg).
};

// ---------------------------------------------------------------------------------------------
// Primitives

const CHAR_W = 0.47; // Anton's approximate cap advance in em — good enough to auto-fit a hook line

function fitSize(lines: string[], maxWidth: number, cap: number, min = 54): number {
  const longest = lines.reduce((m, l) => Math.max(m, (l || '').length), 1);
  return Math.max(min, Math.min(cap, Math.round(maxWidth / (CHAR_W * longest))));
}

/**
 * Size the two hook lines INDEPENDENTLY, then fit the block to the column.
 * Sizing both to the longer line (what v1 did) shrinks a short punchy number like "$4,661" down to
 * the size of "JUST TO CLOSE" — and at that size Anton's comma disappears on a phone. The winners
 * all give the short line the bigger type. The 1.55x clamp stops it turning into a size clash.
 */
function hookSizes(headline: string, emphasis: string | undefined, colW: number, colH: number,
                   cap: number): [number, number] {
  let h = fitSize([headline], colW, cap);
  if (!emphasis) return [h, 0];
  let e = fitSize([emphasis], colW, cap);
  const small = Math.min(h, e);
  h = Math.min(h, Math.round(small * 1.55));
  e = Math.min(e, Math.round(small * 1.55));
  const block = (h + e) * 0.98;
  if (block > colH) {
    const k = colH / block;
    h = Math.round(h * k); e = Math.round(e * k);
  }
  return [h, e];
}

/**
 * The legibility device the old version was missing. A soft drop shadow disappears over a photo at
 * phone size; a thick black outline does not. Rendered as two stacked copies (a black back copy
 * carrying -webkit-text-stroke, a fill copy on top) because a centered stroke alone eats into the
 * glyph and thins the letterform. paint-order is not relied on.
 */
const Stroked: React.FC<{
  text: string; color: string; size: number; stroke?: number; style?: React.CSSProperties;
}> = ({ text, color, size, stroke, style }) => {
  const w = stroke ?? Math.max(6, Math.round(size * 0.085));
  const base: React.CSSProperties = {
    fontFamily: HOOK_STACK, fontWeight: 400, fontSize: size, lineHeight: 0.92,
    letterSpacing: -1, textTransform: 'uppercase', whiteSpace: 'pre', margin: 0, ...style,
  };
  return (
    <div style={{ position: 'relative', display: 'block' }}>
      <div style={{
        ...base, color: '#000',
        WebkitTextStroke: `${w}px #000`,
        // a hard offset shadow under the outline = the "sticker" look every winner has
        textShadow: `0 ${Math.round(size * 0.05)}px 0 rgba(0,0,0,0.55), 0 ${Math.round(size * 0.09)}px ${Math.round(size * 0.12)}px rgba(0,0,0,0.7)`,
      }}>{text}</div>
      <div style={{ ...base, color, position: 'absolute', left: 0, top: 0 }}>{text}</div>
    </div>
  );
};

const Pill: React.FC<{ text: string; bg: string; fg?: string; size?: number }> = ({
  text, bg, fg = '#000', size = 30,
}) => (
  <div style={{
    display: 'inline-block', alignSelf: 'flex-start',
    background: bg, color: fg,
    fontFamily: UI_STACK, fontWeight: 900, fontSize: size, letterSpacing: 2,
    textTransform: 'uppercase', padding: `${Math.round(size * 0.36)}px ${Math.round(size * 0.8)}px`,
    borderRadius: RADIUS.pill, border: '4px solid #000',
    boxShadow: '0 8px 0 rgba(0,0,0,0.45)', whiteSpace: 'nowrap',
  }}>{text}</div>
);

const Badge: React.FC<{ text: string; color: string; side: 'left' | 'right'; fg?: string }> = ({
  text, color, side, fg = '#000',
}) => (
  <div style={{
    position: 'absolute', bottom: 42, [side]: 46,
    background: color, color: fg,
    fontFamily: UI_STACK, fontWeight: 900, fontSize: 42, letterSpacing: 1,
    textTransform: 'uppercase', padding: '14px 28px', borderRadius: 14,
    border: '6px solid #000', boxShadow: '0 10px 0 rgba(0,0,0,0.5)',
    transform: 'rotate(-2deg)', whiteSpace: 'nowrap',
  } as React.CSSProperties}>{text}</div>
);

const ROT: Record<string, number> = {
  right: 0, downright: 45, down: 90, downleft: 135,
  left: 180, upleft: 225, up: 270, upright: 315,
};

/** One chunky block arrow. vidIQ 2026: one or two directional cues, never more. */
const Arrow: React.FC<{ dir: string; at: number[]; color: string; len?: number }> = ({
  dir, at, color, len = 250,
}) => {
  const deg = ROT[dir] ?? 0;
  const h = len * 0.62;
  // tip sits at (at[0]%, at[1]%); the body extends backwards along -x before rotation
  return (
    <div style={{
      position: 'absolute', left: `${at[0]}%`, top: `${at[1]}%`, width: len, height: h,
      transform: `translate(-100%, -50%) rotate(${deg}deg)`, transformOrigin: '100% 50%',
      filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.55))',
    }}>
      <svg viewBox="0 0 100 62" width={len} height={h}>
        <path d="M2 20 H58 V4 L97 31 L58 58 V42 H2 Z" fill={color} stroke="#000" strokeWidth="5"
          strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** Hand-drawn-ish circle callout — two slightly offset ellipses so it reads as marker, not clip-art. */
const CircleCallout: React.FC<{ at: number[]; color: string }> = ({ at, color }) => {
  const [x, y, w, h] = at;
  return (
    <div style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`,
      transform: 'translate(-50%, -50%) rotate(-6deg)',
      filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))',
    }}>
      <svg viewBox="0 0 200 120" width="100%" height="100%" preserveAspectRatio="none">
        <ellipse cx="100" cy="60" rx="94" ry="54" fill="none" stroke="#000" strokeWidth="16" />
        <ellipse cx="100" cy="60" rx="94" ry="54" fill="none" stroke={color} strokeWidth="9" />
        <ellipse cx="101" cy="62" rx="90" ry="50" fill="none" stroke={color} strokeWidth="5"
          opacity="0.75" />
      </svg>
    </div>
  );
};

/**
 * The host's face as a circular bug — the vidIQ "face OR high contrast" lever, now that this channel
 * HAS a face (Walt). Thick black-then-accent ring matches the Stroked/Pill/Badge visual language so
 * it reads as one system, not a sticker slapped on top. Default corner (bottom-left) deliberately
 * clears both the text column (top, same side) and the opposite badge (bottom, other side).
 */
const FaceBadge: React.FC<{ src: string; at: number[]; color: string; focus?: string }> = ({
  src, at, color, focus = '50% 25%',
}) => {
  const [x, y, sizePct] = at;
  return (
    <div style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`, height: `${sizePct}%`, aspectRatio: '1 / 1',
      transform: 'translate(-50%, -50%)',
      borderRadius: '50%', overflow: 'hidden',
      border: '8px solid #000', outline: `7px solid ${color}`, outlineOffset: '-1px',
      boxShadow: '0 14px 28px rgba(0,0,0,0.55)',
    }}>
      <Img src={staticFile(src)} style={{
        width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus,
      }} />
    </div>
  );
};

/**
 * The host as a large, integrated cutout — the real Elias-style composition. `src` must already be
 * background-removed (RGBA PNG with real transparency, e.g. via `rembg`); this component does not
 * remove a background itself, it just places a pre-cut photo bottom-anchored and sized off frame
 * HEIGHT so he reads as standing/sitting IN the scene rather than floating in a bubble on top of it.
 * A soft drop shadow keeps him from looking pasted-on against a busy photo.
 */
const FaceCutout: React.FC<{ src: string; at: number[] }> = ({ src, at }) => {
  const [xPct, sizePct] = [at[0], at[2] ?? at[1]];
  // anchored to the BOTTOM edge (y is ignored - a standing/sitting host's feet-off-frame base sits at
  // the bottom, not floating mid-frame like the circular bug), so only x position and size vary.
  return (
    <div style={{
      position: 'absolute', left: `${xPct}%`, bottom: 0, height: `${sizePct}%`,
      transform: 'translateX(-50%)',
      filter: 'drop-shadow(-12px 0 24px rgba(0,0,0,0.55)) drop-shadow(0 0 40px rgba(0,0,0,0.35))',
    }}>
      <Img src={staticFile(src)} style={{ height: '100%', width: 'auto', display: 'block' }} />
    </div>
  );
};

// Renders nothing when BRAND.wordmark is unset, so a blank brand can never stamp an empty badge
// onto a client deliverable.
const Wordmark: React.FC = () => {
  const text = BRAND.wordmark.join('').trim();
  if (!text) return null;
  return (
    <div style={{
      position: 'absolute', right: 40, top: 32,
      fontFamily: UI_STACK, fontWeight: 800, fontSize: 30, letterSpacing: 1,
      color: '#ffffff', opacity: 0.85, textShadow: '0 2px 8px rgba(0,0,0,0.8)',
    }}>{text}</div>
  );
};

/** The photo layer: cover-fit + a real saturation/contrast punch. Muted stock is the #2 killer. */
const Photo: React.FC<{ src: string; punch: number; focus: string; style?: React.CSSProperties }> = ({
  src, punch, focus, style,
}) => (
  <Img
    src={staticFile(src)}
    style={{
      width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus,
      filter: `saturate(${(1 + 0.38 * punch).toFixed(2)}) contrast(${(1 + 0.18 * punch).toFixed(2)}) brightness(${(1 + 0.04 * punch).toFixed(2)})`,
      ...style,
    }}
  />
);

/**
 * Directional scrim. Dense where the text sits, fully transparent over the subject, so the photo
 * still reads as a photo. A flat 60% black overlay (what `bleed` used to do) kills the image and
 * still doesn't make the text pop.
 */
function scrim(align: 'left' | 'right'): string {
  const dir = align === 'left' ? '90deg' : '270deg';
  // Tuned by eye against a bright daylight photo: dense enough that white-on-photo survives at phone
  // size, loose enough that the frame still reads as a photograph rather than a black card with a
  // picture stapled to one side.
  return `linear-gradient(${dir}, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.84) 24%, rgba(0,0,0,0.62) 42%, rgba(0,0,0,0.28) 58%, rgba(0,0,0,0.04) 78%, rgba(0,0,0,0) 100%)`;
}

// ---------------------------------------------------------------------------------------------

export const Thumbnail: React.FC<ThumbnailProps> = ({
  headline, emphasis, kicker, sub, badge, accent = 'pop', variant = 'photo',
  image, image2, labelA, labelB, valueA, valueB,
  arrow, arrowAt, circleAt, align = 'left', pos = 'center',
  focus = '50% 50%', punch = 1, wordmark = false,
  face, faceAt, faceFocus, faceCutout = false,
}) => {
  const color = ACCENTS[accent] || accent;
  const justify = pos === 'top' ? 'flex-start' : pos === 'bottom' ? 'flex-end' : 'center';
  // default bug sits bottom, opposite the text column's alignment edge, clear of the corner badge
  // (which sits bottom on the OTHER side per the existing align === 'left' ? 'right' : 'left' rule)
  const faceDefaultAt = align === 'left' ? [16, 86, 30] : [84, 86, 30];

  // ---- versus: two photos, one contrast. For before/after and "$0 vs 3%" style bets.
  if (variant === 'versus' && image && image2) {
    const vSize = fitSize([valueA || '', valueB || ''], 480, 210, 90);
    const half = (img: string, label?: string, value?: string, side: 'left' | 'right' = 'left') => (
      <div style={{ position: 'relative', width: '50%', height: '100%', overflow: 'hidden' }}>
        <Photo src={img} punch={punch} focus={focus} />
        <AbsoluteFill style={{
          background: 'linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.10) 75%, rgba(0,0,0,0) 100%)',
        }} />
        <AbsoluteFill style={{
          padding: 34, paddingBottom: 40, display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end', alignItems: 'center', gap: 16,
        }}>
          {value && <Stroked text={value} color={side === 'left' ? '#ffffff' : color} size={vSize}
            style={{ textAlign: 'center' }} />}
          {/* 38, not 30: at 246px (a YouTube phone feed thumbnail) a 30px pill is unreadable mush */}
          {label && <Pill text={label} bg={side === 'left' ? '#ffffff' : color} size={38} />}
        </AbsoluteFill>
      </div>
    );
    const bandSize = fitSize([headline], 1140, 96, 44);
    return (
      <AbsoluteFill style={{ backgroundColor: '#000' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          {half(image, labelA, valueA, 'left')}
          {half(image2, labelB, valueB, 'right')}
        </div>
        {/* divider */}
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0, width: 14, marginLeft: -7,
          background: '#000', boxShadow: `0 0 0 5px ${color}`,
        }} />
        {headline && (
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 0, background: color,
            borderBottom: '7px solid #000', padding: '14px 24px', textAlign: 'center',
          }}>
            <div style={{
              fontFamily: HOOK_STACK, fontSize: bandSize, lineHeight: 1.02, color: '#000',
              textTransform: 'uppercase', letterSpacing: -0.5,
            }}>{headline}</div>
          </div>
        )}
        {circleAt && circleAt.length === 4 && <CircleCallout at={circleAt} color={color} />}
        {arrow && arrowAt && arrowAt.length === 2 && <Arrow dir={arrow} at={arrowAt} color={color} />}
        {wordmark && <Wordmark />}
      </AbsoluteFill>
    );
  }

  // ---- photo (DEFAULT): full-bleed photograph + directional scrim + big two-tone stroked hook.
  if ((variant === 'photo' || variant === 'bleed') && image) {
    const colW = 720;
    const [hSize, eSize] = hookSizes(headline, emphasis, colW, 470, 240);
    const edge = align === 'left'
      ? { left: 52, right: 'auto' as const, alignItems: 'flex-start' as const, textAlign: 'left' as const }
      : { left: 'auto' as const, right: 52, alignItems: 'flex-end' as const, textAlign: 'right' as const };
    return (
      <AbsoluteFill style={{ backgroundColor: '#000' }}>
        <Photo src={image} punch={punch} focus={focus} />
        <AbsoluteFill style={{ background: scrim(align) }} />
        <AbsoluteFill style={{
          background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.12) 22%, rgba(0,0,0,0) 45%)',
        }} />
        {circleAt && circleAt.length === 4 && <CircleCallout at={circleAt} color={color} />}
        {arrow && arrowAt && arrowAt.length === 2 && <Arrow dir={arrow} at={arrowAt} color={color} />}
        <div style={{
          position: 'absolute', top: 44, bottom: 44, width: colW + 16,
          display: 'flex', flexDirection: 'column', justifyContent: justify, gap: 18,
          ...edge,
        }}>
          {kicker && <Pill text={kicker} bg={color} size={30} />}
          <div>
            <Stroked text={headline} color="#ffffff" size={hSize} />
            {emphasis && <Stroked text={emphasis} color={color} size={eSize} />}
          </div>
          {sub && (
            <div style={{
              fontFamily: UI_STACK, fontWeight: 800, fontSize: 38, color: '#fff',
              background: 'rgba(0,0,0,0.72)', border: `4px solid ${color}`, borderRadius: 10,
              padding: '10px 20px', letterSpacing: 0.5,
            }}>{sub}</div>
          )}
        </div>
        {badge && <Badge text={badge} color={color} side={align === 'left' ? 'right' : 'left'} />}
        {face && (faceCutout
          ? <FaceCutout src={face} at={faceAt ?? [78, 92]} />
          : <FaceBadge src={face} at={faceAt ?? faceDefaultAt} color={color} focus={faceFocus} />)}
        {wordmark && <Wordmark />}
      </AbsoluteFill>
    );
  }

  // ---- split: text column + a framed real screenshot (evidence-forward). Now on a saturated block,
  // not near-black, and with the same stroked text as everything else.
  if (variant === 'split' && image) {
    const [hSize, eSize] = hookSizes(headline, emphasis, 600, 400, 190);
    return (
      <AbsoluteFill style={{ backgroundColor: '#0b0b0f' }}>
        <AbsoluteFill style={{
          background: `radial-gradient(75% 110% at 22% 45%, ${color}59 0%, ${color}18 45%, rgba(0,0,0,0) 78%)`,
        }} />
        <div style={{
          position: 'absolute', left: 52, top: 52, bottom: 52, width: 620,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20,
        }}>
          {kicker && <Pill text={kicker} bg={color} size={28} />}
          <div>
            <Stroked text={headline} color="#ffffff" size={hSize} />
            {emphasis && <Stroked text={emphasis} color={color} size={eSize} />}
          </div>
          {sub && <div style={{
            fontFamily: UI_STACK, fontWeight: 800, fontSize: 34, color: '#fff',
            background: 'rgba(0,0,0,0.7)', border: `4px solid ${color}`, borderRadius: 10,
            padding: '8px 18px',
          }}>{sub}</div>}
        </div>
        <div style={{
          position: 'absolute', right: 48, top: 56, bottom: 56, width: 520,
          borderRadius: RADIUS.card, overflow: 'hidden',
          border: `10px solid ${color}`, outline: '6px solid #000',
          boxShadow: '0 24px 60px rgba(0,0,0,0.65)', background: COLORS.paper,
          transform: 'rotate(1.5deg)',
        }}>
          <Photo src={image} punch={punch * 0.5} focus={focus} />
        </div>
        {circleAt && circleAt.length === 4 && <CircleCallout at={circleAt} color={color} />}
        {arrow && arrowAt && arrowAt.length === 2 && <Arrow dir={arrow} at={arrowAt} color={color} />}
        {badge && <Badge text={badge} color={color} side="left" />}
        {face && <FaceBadge src={face} at={faceAt ?? [16, 86, 28]} color={color} focus={faceFocus} />}
        {wordmark && <Wordmark />}
      </AbsoluteFill>
    );
  }

  // ---- word: NO PHOTO AVAILABLE fallback only. Deliberately a saturated color block, never the old
  // near-black gradient. Do not ship this as one of the three A/B/C bets if a photo can be fetched —
  // see the Thumbnail Checklist in .claude/skills/packaging/SKILL.md.
  const [hSize, eSize] = hookSizes(headline, emphasis, 1100, 520, 280);
  return (
    <AbsoluteFill style={{ backgroundColor: color }}>
      <AbsoluteFill style={{
        background: `radial-gradient(90% 120% at 20% 12%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 55%), linear-gradient(160deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.38) 100%)`,
      }} />
      {/* diagonal stripes so a flat block still has texture at phone size */}
      <AbsoluteFill style={{
        background: 'repeating-linear-gradient(-45deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 26px, rgba(0,0,0,0) 26px, rgba(0,0,0,0) 60px)',
      }} />
      <AbsoluteFill style={{
        padding: 64, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'flex-start', gap: 22,
      }}>
        {kicker && <Pill text={kicker} bg="#000" fg={color} size={32} />}
        <div>
          <Stroked text={headline} color="#ffffff" size={hSize} />
          {emphasis && <Stroked text={emphasis} color="#000000" size={eSize} stroke={0} />}
        </div>
        {sub && <div style={{
          fontFamily: UI_STACK, fontWeight: 900, fontSize: 42, color: '#fff',
          background: '#000', borderRadius: 10, padding: '10px 22px',
        }}>{sub}</div>}
      </AbsoluteFill>
      {circleAt && circleAt.length === 4 && <CircleCallout at={circleAt} color="#000" />}
      {arrow && arrowAt && arrowAt.length === 2 && <Arrow dir={arrow} at={arrowAt} color="#000" />}
      {/* the block background IS the accent here, so the badge inverts: black plate, accent text */}
      {badge && <Badge text={badge} color="#000" fg={color} side="right" />}
      {wordmark && <Wordmark />}
    </AbsoluteFill>
  );
};
