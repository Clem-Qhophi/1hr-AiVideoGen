import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SSBg, SSLine, SSEyebrow, SSDrift, SS, VW, FONT_DISPLAY, FONT_HOOK } from './sskit';
import { usePop } from '../../lib/reviewkit';

// master 51.10-56.70 (168f) · CTA. One action only: DM. Handle slams at 51.2s, the lasts-line
// pops at 54.1s (ASR-synced). Ordering facts under it.
export const compositionConfig = { id: 'SSCTA', durationInSeconds: 5.6, fps: 30, width: 1080, height: 1920 };

const SSCTA: React.FC = () => {
  const pop = usePop();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <SSBg>
        <SSDrift frames={168}>
          <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 70px', textAlign: 'center' }}>
            <SSEyebrow>ORDER TODAY</SSEyebrow>
            <SSLine text="DM" start={8} size={150} color={SS.accent} />
            <SSLine text="@SOFTSTEP_SLIDES" start={18} size={112} />
            <div
              style={{
                fontFamily: FONT_HOOK, fontSize: 50, color: SS.white, textAlign: 'center',
                background: SS.accent2, borderRadius: 40, padding: '24px 56px', marginTop: 24,
                ...pop(90),
              }}
            >
              YOUR NEXT PAIR COULD BE THE ONE THAT LASTS
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 600, color: SS.muted, marginTop: 26, lineHeight: 1.5 }}>
              NATIONWIDE DELIVERY · PAY ON DELIVERY WITHIN ACCRA
            </div>
          </AbsoluteFill>
        </SSDrift>
      </SSBg>
    </AbsoluteFill>
  );
};
export default SSCTA;
