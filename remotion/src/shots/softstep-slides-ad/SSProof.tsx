import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SSBg, SSDrift, SSPill, SS, VW, FONT_DISPLAY } from './sskit';
import { usePop } from '../../lib/reviewkit';

// master 42.00-51.10 (273f) · PROOF. Honest cards: nationwide delivery at fee, pay-on-delivery
// within Accra, real prices (GHS 350–500), you don't pay until slides are in your hands.
export const compositionConfig = { id: 'SSProof', durationInSeconds: 9.1, fps: 30, width: 1080, height: 1920 };

const SSProof: React.FC = () => {
  const pop = usePop();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <SSBg>
        <SSDrift frames={273}>
          <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36, padding: '0 80px', textAlign: 'center' }}>
            <SSPill start={10} accent={SS.accent2} style={{ maxWidth: 900, width: '100%' }}>
              NATIONWIDE DELIVERY
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 600, color: SS.muted, marginTop: 10, letterSpacing: 0.5 }}>
                DELIVERY FEE APPLIES ACROSS GHANA
              </div>
            </SSPill>
            <SSPill start={55} accent={SS.accent} style={{ maxWidth: 900, width: '100%' }}>
              PAY ON DELIVERY
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 600, color: SS.muted, marginTop: 10, letterSpacing: 0.5 }}>
                WITHIN ACCRA — NO MONEY UP FRONT
              </div>
            </SSPill>
            <SSPill start={122} accent={SS.text} style={{ maxWidth: 900, width: '100%' }}>
              YOU DON'T PAY UNTIL THEY'RE IN YOUR HANDS
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 600, color: SS.muted, marginTop: 10, letterSpacing: 0.5 }}>
                ORDER VIA DM — WE HANDLE THE REST
              </div>
            </SSPill>
            <div style={{ ...pop(211), width: '100%', background: 'linear-gradient(135deg, #FF6B35 0%, #E8531F 100%)', borderRadius: 28, padding: '44px 48px', display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'center' }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 68, color: '#fff', lineHeight: 1.05 }}>GH₵ 350 – 500</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: 'rgba(255,255,255,0.85)', letterSpacing: 2, fontWeight: 600 }}>SIZES 38 · 39 · 40 · 41 · 42 · 43 · 44 · 45 · 46</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: 'rgba(255,255,255,0.70)', letterSpacing: 1, fontWeight: 500 }}>DM @SOFTSTEP_SLIDES TO ORDER · PAY ON DELIVERY IN ACCRA</div>
            </div>
          </AbsoluteFill>
        </SSDrift>
      </SSBg>
    </AbsoluteFill>
  );
};
export default SSProof;
