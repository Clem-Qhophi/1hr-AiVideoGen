import React from 'react';
import { AbsoluteFill } from 'remotion';
import { MVBg, MVDrift, MVLogo, MVLine, MVEyebrow, MV, FONT_DISPLAY, FONT_HOOK, FONT_MONO } from './mvkit';
import { usePop, useSlam } from '../../lib/reviewkit';

// master 26.70-29.40 (81f) · CTA. Logo + WhatsApp number. VO: Message(26.71 lands at
// frame 0) Maviga(27.09 f12) WhatsApp(28.15 f44). Number pops right after 'WhatsApp'.
export const compositionConfig = { id: 'MVCTA', durationInSeconds: 2.7, fps: 30, width: 1080, height: 1920 };

const MVCTA: React.FC = () => {
  const pop = usePop();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <MVBg>
        <MVDrift frames={81}>
          <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 60px', textAlign: 'center' }}>
            <MVLogo width={340} />
            <MVEyebrow style={{ marginTop: 2 }}>MAKE THE MOVE</MVEyebrow>
            <MVLine text="MESSAGE US ON WHATSAPP" start={6} size={70} />
            <div style={{ ...pop(46), background: MV.ink, borderRadius: 20, padding: '20px 30px', display: 'flex', flexDirection: 'column', gap: 4, width: '100%', maxWidth: 660 }}>
              <div style={{ fontFamily: FONT_HOOK, fontSize: 58, color: MV.white, lineHeight: 1.05 }}>054 072 1425</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 18, letterSpacing: 2, color: '#D8D5C2' }}>WA.ME/233540721425</div>
            </div>
            <div style={{ ...slam(60), fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, color: MV.ink, letterSpacing: 1 }}>
              YOUR FUTURE, YOUR LAND.
            </div>
          </AbsoluteFill>
        </MVDrift>
      </MVBg>
    </AbsoluteFill>
  );
};
export default MVCTA;
