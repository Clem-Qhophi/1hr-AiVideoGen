import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 129.0-139.9 · the wider findings tally. mobile OS f40, database f150, kernel f220.
export const compositionConfig = { id: 'CYFind', durationInSeconds: 10.9, fps: 30, width: 1920, height: 1080 };

const CYFind: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(327);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 120px', textAlign: 'center' }}>
        <div style={rise(3, 12)}><Eyebrow color={RM.cyan}>The same model, across the stack</Eyebrow></div>
        <div style={{ display: 'flex', gap: 34, marginTop: 12 }}>
          <div style={{ ...pop(40, 12), width: 480, background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 18, padding: '30px 36px' }}>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 96, color: RM.cyan, lineHeight: 1 }}>5+</div>
            <div style={{ fontSize: 26, fontWeight: 600, color: RM.text, marginTop: 10 }}>vulnerabilities</div>
            <div style={{ fontSize: 22, color: RM.muted, marginTop: 4 }}>a popular MOBILE OS</div>
          </div>
          <div style={{ ...pop(150, 12), width: 480, background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 18, padding: '30px 36px' }}>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 96, color: RM.red, lineHeight: 1 }}>3</div>
            <div style={{ fontSize: 26, fontWeight: 600, color: RM.text, marginTop: 10 }}>critical ones</div>
            <div style={{ fontSize: 22, color: RM.muted, marginTop: 4 }}>a popular DATABASE</div>
          </div>
          <div style={{ ...pop(225, 12), width: 480, background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 18, padding: '30px 36px' }}>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 96, color: RM.amber, lineHeight: 1 }}>400+</div>
            <div style={{ fontSize: 26, fontWeight: 600, color: RM.text, marginTop: 10 }}>privilege-escalation bugs</div>
            <div style={{ fontSize: 22, color: RM.muted, marginTop: 4 }}>a popular KERNEL</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYFind;
