import React from 'react';
import { AbsoluteFill } from 'remotion';
import { MVBg, MVDrift, FlyerCrop, MVChip, MV, FONT_DISPLAY, MVEyebrow, MVLine } from './mvkit';
import { usePop } from '../../lib/reviewkit';

// master 12.10-20.10 (240f) · CASH. "The price?" tease opens the beat, then the cash hero
// + the three real flyer payment cards. VO: The price?(12.83) Thirty thousand cedis
// cash(14.29) or spread it(15.89) thirty-five thousand(16.69) six months(17.75)
// forty thousand(18.68) twelve(19.58).
export const compositionConfig = { id: 'MVCash', durationInSeconds: 8.0, fps: 30, width: 1080, height: 1920 };

const MVCash: React.FC = () => {
  const pop = usePop();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <MVBg>
        <MVDrift frames={240}>
          <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 70px', textAlign: 'center' }}>
            <MVEyebrow style={{ marginTop: 4 }}>CHOOSE YOUR PAYMENT OPTION</MVEyebrow>
            <MVLine text="THE PRICE?" start={18} size={92} />
            <MVLine text="GHC 30,000" start={58} size={124} />
            <MVLine text="CASH PRICE" start={76} size={66} color={MV.olive} />
            <div style={{ display: 'flex', flexDirection: 'row', gap: 16, marginTop: 2 }}>
              <FlyerCrop name="option1.png" label="" start={92} width={200} />
              <FlyerCrop name="option3.png" label="" start={104} width={200} />
              <FlyerCrop name="option2.png" label="" start={116} width={200} />
            </div>
            <MVChip start={142} accent={MV.ink} style={{ maxWidth: 780, width: '100%' }}>
              OR SPREAD IT: 35K / 6 MO · 40K / 12 MO
            </MVChip>
            <div style={{ ...pop(200), fontFamily: FONT_DISPLAY, fontSize: 26, color: MV.muted, fontWeight: 600, letterSpacing: 1 }}>
              FLEXIBLE PAYMENTS · GHC 5,000 TO START
            </div>
          </AbsoluteFill>
        </MVDrift>
      </MVBg>
    </AbsoluteFill>
  );
};
export default MVCash;
