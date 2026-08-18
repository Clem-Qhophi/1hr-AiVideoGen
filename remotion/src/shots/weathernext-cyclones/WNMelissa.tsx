import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';
import { EvidenceFrame } from '../../lib/evidence';

// master 87.64-126.20 · melissa proof. not-a-lab-demo f9, weak depression f187, waver f242, 80% f409,
// near certain f469, tied strongest f592, cat5 jump f808, report f~990 -> evidence at f1042.
export const compositionConfig = { id: 'WNMelissa', durationInSeconds: 38.6, fps: 30, width: 1920, height: 1080 };

const WNMelissa: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(1157);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.green} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.green}>Not a lab demo · NHC ran it live in 2025</Eyebrow></div>
        <div style={{ ...rise(187, 18), fontSize: 34, fontWeight: 500, color: RM.muted, textAlign: 'center' }}>
          Melissa was a weak depression. The physics models wavered.
        </div>
        <div style={{ ...rise(242, 18), fontSize: 34, fontWeight: 500, color: RM.muted, textAlign: 'center' }}>
          Haiti... or Jamaica? Nobody was sure.
        </div>
        <div style={{ ...slam(409, 8), fontFamily: FONT_HOOK, fontSize: 84, color: RM.green, textShadow: `0 8px 36px ${RM.green}44` }}>
          JAMAICA · CATEGORY 5
        </div>
        <div style={{ ...rise(469, 18), fontSize: 32, fontWeight: 500, color: RM.text }}>
          80% confidence, 5 days out → near-certain, 3 days out
        </div>
        <div style={{ ...rise(592, 18), marginTop: 6, fontSize: 30, fontWeight: 600, color: RM.text }}>
          Strongest hurricane on record to hit Jamaica — tied for strongest in the Atlantic
        </div>
        <div style={{ ...rise(808, 18), marginTop: 6, fontSize: 30, fontWeight: 600, color: RM.amber }}>
          First-ever NHC Category-5 call from a Category-1 start
        </div>
      </AbsoluteFill>
      <EvidenceFrame
        image="projects/weathernext-cyclones/evidence/nhc-verification-2025.png"
        source="NHC 2025 Verification Report, NOAA · Mar 30 2026"
        label="THE NHC'S OWN REPORT"
        appearAt={990}
        scale={0.9}
      />
      <AbsoluteFill style={{ ...rise(1120, 16), flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 70 }}>
        <div style={{ fontSize: 26, fontWeight: 600, color: RM.text, background: `${RM.panel}cc`, borderRadius: 14, padding: '10px 24px' }}>
          Top-performing individual model, on track and intensity
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default WNMelissa;
