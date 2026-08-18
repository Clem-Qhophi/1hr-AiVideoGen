// The Money Archive — YouTube channel banner. 2048x1152, safe area (visible on all devices) is the
// centered 1235x338 box: x 406.5-1641.5, y 407-745 (same YouTube-defined safe zone used by
// ForgottenFixBanner.tsx). Wordmark/tagline/seal all sit inside it; only decorative ledger-rule
// texture extends into the desktop/TV-only margins.
import React from 'react';

export const compositionConfig = {
  id: 'MoneyArchiveBanner',
  durationInSeconds: 1,
  fps: 30,
  width: 2048,
  height: 1152,
};

const C = {
  paperTop: '#f6f1e7',
  paperBottom: '#ece2c8',
  ink: '#241f1a',
  muted: '#6b6255',
  green: '#3f6b52',
  rule: '#c9bfa8',
};

const ruleYs = Array.from({ length: 24 }, (_, i) => 40 + i * 48);

export default function MoneyArchiveBanner(): React.ReactElement {
  return (
    <svg width={2048} height={1152} viewBox="0 0 2048 1152" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.paperTop} />
          <stop offset="100%" stopColor={C.paperBottom} />
        </linearGradient>
      </defs>
      <rect width={2048} height={1152} fill="url(#bg)" />

      {/* faint ledger rule lines, full-bleed decorative texture */}
      {ruleYs.map((y) => (
        <line key={y} x1={0} y1={y} x2={2048} y2={y} stroke={C.rule} strokeWidth={1.5} opacity={0.35} />
      ))}

      {/* safe-zone content: wordmark + tagline (left) + seal mark (right), all within
          x 406-1642, y 407-745. Seal starts at x=1420, so text block is capped ~950px wide. */}
      <text
        x={440}
        y={500}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight={700}
        fontSize={66}
        letterSpacing={1}
        fill={C.ink}
      >
        THE MONEY ARCHIVE
      </text>
      <text
        x={440}
        y={556}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontSize={28}
        fill={C.muted}
      >
        Plain-English money explainers,
      </text>
      <text
        x={440}
        y={594}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontSize={28}
        fill={C.muted}
      >
        built to still be true in five years.
      </text>
      <line x1={440} y1={628} x2={1180} y2={628} stroke={C.green} strokeWidth={3} opacity={0.7} />
      <text
        x={440}
        y={672}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={26}
        fill={C.muted}
      >
        Every number sourced on screen.
      </text>

      {/* seal mark */}
      <g transform="translate(1530 576)">
        <circle r={140} fill={C.paperBottom} stroke={C.ink} strokeWidth={6} />
        <circle r={116} fill="none" stroke={C.muted} strokeWidth={2} opacity={0.6} />
        {Array.from({ length: 40 }, (_, i) => {
          const a = (i / 40) * Math.PI * 2;
          const x1 = Math.cos(a) * 110;
          const y1 = Math.sin(a) * 110;
          const x2 = Math.cos(a) * 96;
          const y2 = Math.sin(a) * 96;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.muted} strokeWidth={2} opacity={0.5} />;
        })}
        <text
          x={0}
          y={38}
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight={700}
          fontSize={92}
          fill={C.ink}
        >
          MA
        </text>
        <line x1={-46} y1={54} x2={46} y2={54} stroke={C.green} strokeWidth={5} strokeLinecap="round" />
      </g>
    </svg>
  );
}
