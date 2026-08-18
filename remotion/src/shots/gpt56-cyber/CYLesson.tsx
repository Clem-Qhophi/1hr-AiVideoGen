import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 334.2-354.4 · step back: capability and caution are separate products.
// "refuses 1.5%" f70, "completes 95%" f195, "two weeks apart" f285, "separate products" f430,
// "who gets the yes" f570.
export const compositionConfig = { id: 'CYLesson', durationInSeconds: 20.2, fps: 30, width: 1920, height: 1080 };

const CYLesson: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(606);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0 130px', textAlign: 'center' }}>
        <div style={rise(3, 12)}><Eyebrow color={RM.cyan}>Step back</Eyebrow></div>
        <div style={{ display: 'flex', gap: 34, marginTop: 16 }}>
          <div style={{ ...pop(70, 12), width: 540, background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 18, padding: '28px 36px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: 2, color: RM.muted }}>SAFEST MODEL OPENAI SELLS</div>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 110, color: RM.green, lineHeight: 1, marginTop: 8 }}>1.5%</div>
            <div style={{ fontSize: 24, color: RM.muted, marginTop: 6 }}>refuses attacks</div>
          </div>
          <div style={{ ...pop(195, 12), width: 540, background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 18, padding: '28px 36px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: 2, color: RM.muted }}>STRONGEST IT OWNS</div>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 110, color: RM.cyan, lineHeight: 1, marginTop: 8 }}>95%</div>
            <div style={{ fontSize: 24, color: RM.muted, marginTop: 6 }}>completes attacks</div>
          </div>
        </div>
        <div style={{ ...rise(300, 16), marginTop: 10, fontSize: 30, fontWeight: 500, color: RM.text }}>
          Same family · same company · <span style={{ color: RM.amber }}>two weeks apart</span>
        </div>
        <div style={{ ...slam(430, 9), marginTop: 14, fontFamily: FONT_HOOK, fontSize: 64, lineHeight: 1.02, color: RM.text }}>
          CAPABILITY &amp; CAUTION ARE NOW <span style={{ color: RM.cyan }}>SEPARATE PRODUCTS</span>
        </div>
        <div style={{ ...rise(540, 18), marginTop: 14, fontSize: 34, fontWeight: 700, color: RM.muted }}>
          The question isn&rsquo;t whether a model will say <span style={{ color: RM.green }}>yes</span>.
        </div>
        <div style={{ ...rise(575, 18), fontSize: 34, fontWeight: 700, color: RM.cyan }}>
          It&rsquo;s <span style={{ fontFamily: FONT_HOOK, fontSize: 42 }}>who gets the yes.</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYLesson;
