import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 29.4-44.3 · Daybreak two tracks.
// "Quick backstory" f1, "Two tracks" f182, Blue f211, Red f292, "Red gets its sharpest tool yet" f378.
export const compositionConfig = { id: 'CYContext', durationInSeconds: 14.9, fps: 30, width: 1920, height: 1080 };

const CYContext: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(447);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 140px', textAlign: 'center' }}>
        <div style={rise(3, 12)}><Eyebrow color={RM.cyan}>Quick backstory</Eyebrow></div>
        <div style={{ ...slam(28, 9), fontFamily: FONT_HOOK, fontSize: 92, lineHeight: 0.95, color: RM.cyan, textShadow: `0 12px 44px ${RM.cyan}33`, marginTop: 10 }}>
          DAYBREAK
        </div>
        <div style={{ ...rise(70, 16), fontSize: 30, fontWeight: 500, color: RM.muted }}>
          OpenAI&rsquo;s cybersecurity program &middot; launched at DevDay, last fall
        </div>
        <div style={{ ...rise(182, 14), marginTop: 18, fontFamily: 'monospace', fontSize: 26, letterSpacing: 4, color: RM.text }}>
          TWO TRACKS
        </div>
        <div style={{ display: 'flex', gap: 44, marginTop: 10 }}>
          <div style={{ ...pop(214, 12), background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 18, padding: '28px 40px', width: 520 }}>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 64, color: RM.green }}>BLUE</div>
            <div style={{ fontSize: 26, fontWeight: 500, color: RM.text, marginTop: 10 }}>frontier general models</div>
            <div style={{ fontSize: 24, color: RM.muted, marginTop: 4 }}>for the defenders</div>
          </div>
          <div style={{ ...pop(292, 12), background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 18, padding: '28px 40px', width: 520 }}>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 64, color: RM.red }}>RED</div>
            <div style={{ fontSize: 26, fontWeight: 500, color: RM.text, marginTop: 10 }}>purpose-trained</div>
            <div style={{ fontSize: 24, color: RM.muted, marginTop: 4 }}>for offensive work</div>
          </div>
        </div>
        <div style={{ ...rise(378, 16), marginTop: 18, fontSize: 34, fontWeight: 700, color: RM.amber, maxWidth: 1100 }}>
          Today, Red gets its sharpest tool yet.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYContext;
