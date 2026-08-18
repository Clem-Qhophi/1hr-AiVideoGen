// The Money Archive — channel logo / profile picture. A faceless channel (see
// channel-persona.finance.json: "the channel has no face and should not invent one"), so the mark
// is a graphic ledger-seal, not an avatar. Square canvas, safe as a circular YouTube profile crop.
import React from 'react';

export const compositionConfig = {
  id: 'MoneyArchiveSeal',
  durationInSeconds: 1,
  fps: 30,
  width: 1080,
  height: 1080,
};

// Muted paper/ledger palette — deliberately NOT the house indigo/violet brand (brand.md §3b) and
// NOT the vibes.tsx 'fintech' preset (that's a dark neon-green trading-app look). This niche's own
// art direction (niches/finance.json images.style) is muted editorial paper/ledger, calm and quietly
// credible — the opposite of a hype-finance channel.
const C = {
  paper: '#f6f1e7',
  paperDeep: '#ece2c8',
  ink: '#241f1a',
  muted: '#6b6255',
  green: '#3f6b52',
};

const CX = 540;
const CY = 540;
const RING_OUTER = 470;
const RING_INNER = 434;
const TICKS = 60;

export default function MoneyArchiveSeal(): React.ReactElement {
  const ticks = Array.from({ length: TICKS }, (_, i) => {
    const a = (i / TICKS) * Math.PI * 2;
    const x1 = CX + Math.cos(a) * (RING_INNER - 6);
    const y1 = CY + Math.sin(a) * (RING_INNER - 6);
    const x2 = CX + Math.cos(a) * (RING_INNER - 22);
    const y2 = CY + Math.sin(a) * (RING_INNER - 22);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.muted} strokeWidth={3} opacity={0.55} />;
  });

  return (
    <svg width={1080} height={1080} viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
      <rect width={1080} height={1080} fill={C.paper} />
      <circle cx={CX} cy={CY} r={520} fill={C.paperDeep} />

      {/* outer seal ring */}
      <circle cx={CX} cy={CY} r={RING_OUTER} fill="none" stroke={C.ink} strokeWidth={10} />
      <circle cx={CX} cy={CY} r={RING_INNER} fill="none" stroke={C.muted} strokeWidth={2} opacity={0.6} />
      <g>{ticks}</g>

      {/* monogram */}
      <text
        x={CX}
        y={CY + 60}
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight={700}
        fontSize={340}
        fill={C.ink}
      >
        MA
      </text>

      {/* underline flourish */}
      <line x1={CX - 170} y1={CY + 118} x2={CX + 170} y2={CY + 118} stroke={C.green} strokeWidth={10} strokeLinecap="round" />
    </svg>
  );
}
