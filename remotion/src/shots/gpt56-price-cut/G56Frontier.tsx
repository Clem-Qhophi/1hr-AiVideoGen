import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';
import { StatRow } from '../../lib/pricekit';

// master 160.60-236.52 · frontier context. Terra-13x f319, Altman f485, Cognition f665, SolFast f1133, strategies f1530-1938.
export const compositionConfig = { id: 'G56Frontier', durationInSeconds: 76.0, fps: 30, width: 1920, height: 1080 };

const Quote: React.FC<{ text: string; who: string; style: React.CSSProperties }> = ({ text, who, style }) => (
  <div style={{ ...style, width: 1000, textAlign: 'center' }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 30, color: RM.text, fontStyle: 'italic' }}>&ldquo;{text}&rdquo;</div>
    <div style={{ fontFamily: 'monospace', fontSize: 18, color: RM.muted, marginTop: 6 }}>&mdash; {who}</div>
  </div>
);

const Play: React.FC<{ who: string; what: string; style: React.CSSProperties }> = ({ who, what, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'baseline', gap: 16, width: 980 }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, color: RM.cyan, width: 110 }}>{who}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 24, color: RM.text }}>{what}</div>
  </div>
);

const G56Frontier: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(2278);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={rise(6, 16)}><Eyebrow>reading the room</Eyebrow></div>
        <StatRow name="Terra vs GPT 5.4" value="~13x cheaper" source="Nic Dunz, Krea AI" style={pop(319)} accent={RM.amber} />
        <Quote text="major price cuts today" who="Sam Altman, OpenAI CEO, on X" style={pop(485)} />
        <Quote text="sits right on the price-to-performance frontier" who="Cognition, on X" style={pop(665)} />
        <StatRow name="Sol Fast" value="$70 combined" source="most expensive line" style={pop(1133)} accent={RM.red} />
        <div style={{ ...rise(1530, 18), marginTop: 10, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, color: RM.cyan }}>
          Three plays, same problem
        </div>
        <Play who="OpenAI" what="cuts the per-token rate directly" style={pop(1545)} />
        <Play who="Google" what="pairs lower prices with fewer tokens burned" style={pop(1575)} />
        <Play who="Anthropic" what="holds price, ships more capability" style={pop(1605)} />
        <div style={{ ...rise(1938, 18), fontSize: 20, color: RM.muted, fontFamily: 'monospace' }}>
          + a new adjustable effort setting: trade reasoning depth for speed and cost
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56Frontier;
