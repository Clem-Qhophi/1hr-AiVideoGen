import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 161.1-183.06 · verdict close + mid-roll CTA (55-57% of runtime, per Growth Rule #1).
export const compositionConfig = { id: 'NBSHonestVerdict', durationInSeconds: 21.96, fps: 30, width: 1920, height: 1080 };

const NBSHonestVerdict: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(659);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, textAlign: 'center', padding: '0 160px' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.cyan}>the honest read</Eyebrow></div>
        <div style={{ ...rise(40, 18), fontSize: 26, color: RM.green, maxWidth: 1050 }}>
          The science is real. The goal is worth taking seriously.
        </div>
        <div style={{ ...pop(255), fontSize: 40, fontWeight: 800, color: RM.red, marginTop: 8 }}>
          Zero human trials.
        </div>
        <div style={{ ...rise(346, 18), fontSize: 26, color: RM.amber, fontWeight: 600, maxWidth: 1000 }}>
          From a company that's gone quiet for over a year — while loudly updating everything else.
        </div>

        <div style={{
          ...pop(456), marginTop: 26, padding: '18px 36px', border: `2px solid ${RM.cyan}`,
          borderRadius: 14, background: RM.panel, maxWidth: 950,
        }}>
          <div style={{ fontSize: 22, color: RM.text }}>
            This channel checks the primary source instead of repeating the headline.
          </div>
          <div style={{ fontSize: 24, color: RM.cyan, fontWeight: 700, marginTop: 8 }}>
            If that's useful — subscribe.
          </div>
        </div>
        <div style={{ ...rise(560, 18), fontSize: 20, color: RM.muted, fontFamily: FONT_MONO, marginTop: 4 }}>
          drop a comment: volunteer for this, or wait for the data?
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default NBSHonestVerdict;
