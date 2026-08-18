import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';
import { BeforeAfter } from '../../lib/pricekit';

// master 35.93-90.09 · verdict/pricing table. Luna f68/145/217/274/313, Terra f419/484, Sol f583/691/712, close f1177.
export const compositionConfig = { id: 'G56Verdict', durationInSeconds: 54.2, fps: 30, width: 1920, height: 1080 };

const Row: React.FC<{ label: string; accent: string; style: React.CSSProperties; children: React.ReactNode }> = ({ label, accent, style, children }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 28, background: RM.panel, border: `1px solid ${accent}44`, borderRadius: 18, padding: '18px 40px', width: 1300 }}>
    <div style={{ fontFamily: FONT_HOOK, fontSize: 40, color: accent, width: 130 }}>{label}</div>
    {children}
  </div>
);

const G56Verdict: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(1625);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>the verdict · per 1M tokens</Eyebrow></div>

        <Row label="Luna" accent={RM.green} style={pop(68)}>
          <BeforeAfter before="$7" after="$1.40" style={{}} />
          <div style={{ ...slam(313, 8), marginLeft: 'auto', fontFamily: FONT_HOOK, fontSize: 46, color: RM.green }}>10x DROP</div>
        </Row>

        <Row label="Terra" accent={RM.amber} style={pop(419)}>
          <BeforeAfter before="$17.50" after="$14" style={{}} />
          <div style={{ marginLeft: 'auto', fontFamily: FONT_HOOK, fontSize: 40, color: RM.amber }}>-20%</div>
        </Row>

        <Row label="Sol" accent={RM.cyan} style={pop(583)}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: RM.text }}>$5 / $30</div>
          <div style={{ fontFamily: 'monospace', fontSize: 18, color: RM.muted }}>unchanged</div>
          <div style={{ ...pop(691), marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, color: RM.amber }}>+ Fast $10/$60</div>
          </div>
        </Row>

        <div style={{ ...rise(1177, 20), marginTop: 8, fontSize: 30, fontWeight: 600, color: RM.text, textAlign: 'center', maxWidth: 1200 }}>
          Makes GPT 5.6 genuinely cheap to run at scale, for the first time.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56Verdict;
