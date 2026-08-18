import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 293.0-321.9 · close. Verdict recap + MANDATORY subscribe (primary) / like+comment (secondary).
export const compositionConfig = { id: 'NBSClose', durationInSeconds: 28.9, fps: 30, width: 1920, height: 1080 };

const NBSClose: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(867);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: '0 160px' }}>
        <div style={{ ...rise(6, 16), fontSize: 24, color: RM.muted, maxWidth: 950 }}>
          Has anyone connected a human brain to see through a chip?
        </div>
        <div style={{ ...pop(81), fontSize: 44, fontWeight: 800, color: RM.red }}>
          No. Not yet.
        </div>
        <div style={{ display: 'flex', gap: 30, marginTop: 10 }}>
          <div style={{ ...pop(220), fontSize: 20, color: RM.green }}>✓ FDA fast-track, 2024</div>
          <div style={{ ...pop(280), fontSize: 20, color: RM.green }}>✓ 2 programs active</div>
          <div style={{ ...pop(340), fontSize: 20, color: RM.amber }}>— Vision: upcoming</div>
        </div>
        <div style={{ ...rise(464, 18), fontSize: 22, color: RM.muted, maxWidth: 1000, marginTop: 8 }}>
          Not a small thing. Just not the thing the headlines already told you happened.
        </div>

        <div style={{
          ...pop(616), marginTop: 14, background: RM.cyan, color: '#04121a', fontWeight: 800,
          fontSize: 42, padding: '18px 50px', borderRadius: 999, boxShadow: `0 16px 46px ${RM.cyan}44`,
        }}>
          SUBSCRIBE
        </div>
        <div style={{ ...rise(660, 18), fontSize: 20, color: RM.muted }}>
          for the verdict before the hype
        </div>
        <div style={{ ...pop(782), display: 'flex', gap: 36, marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, color: RM.text, fontFamily: FONT_MONO }}>👍 Like</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, color: RM.text, fontFamily: FONT_MONO }}>💬 what should we check next?</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default NBSClose;
