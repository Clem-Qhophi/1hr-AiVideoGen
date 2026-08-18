import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';
import { EvidenceFrame } from '../../lib/evidence';

// master 240.00-285.40 · how it works. 20TB f121, ibtracs f~200, FGN f497, futures f624,
// 28x28 f839, 100x f921, 111km f1069, still works f~1150, surprised f~1190, nobody knows f~1220,
// mini 111km f1069.
export const compositionConfig = { id: 'WNHow', durationInSeconds: 45.4, fps: 30, width: 1920, height: 1080 };

const StatRow: React.FC<{ at: number; head: string; sub: string; color: string }> = ({ at, head, sub, color }) => {
  const rise = useRise();
  return (
    <div style={{ ...rise(at, 16), display: 'flex', alignItems: 'baseline', gap: 22, background: RM.panel, border: `1px solid ${color}55`, borderRadius: 16, padding: '16px 30px', width: 1300 }}>
      <div style={{ fontFamily: FONT_HOOK, fontSize: 40, color, whiteSpace: 'nowrap' }}>{head}</div>
      <div style={{ fontSize: 26, fontWeight: 500, color: RM.muted }}>{sub}</div>
    </div>
  );
};

const WNHow: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(1362);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>How it works</Eyebrow></div>
        <StatRow at={121} head="20 TB" sub="of global weather data" color={RM.cyan} />
        <StatRow at={200} head="5,000 storms" sub="historical cyclone database (IBTrACS)" color={RM.cyan} />
        <div style={{ ...rise(330, 18), fontSize: 30, fontWeight: 500, color: RM.muted }}>
          It learns the physics from examples, not equations.
        </div>
        <div style={{ ...rise(497, 18), fontSize: 32, fontWeight: 600, color: RM.text, textAlign: 'center' }}>
          Functional Generative Networks: a spread of futures, not one guess
        </div>
        <div style={{ ...slam(624, 8), fontFamily: FONT_HOOK, fontSize: 84, color: RM.cyan, textShadow: `0 8px 36px ${RM.cyan}44` }}>
          1,000 POSSIBLE FUTURES
        </div>
        <div style={{ ...rise(839, 18), marginTop: 14, fontSize: 40, fontWeight: 600, color: RM.text }}>
          The input? Just <span style={{ fontFamily: FONT_HOOK, color: RM.amber }}>28 × 28 km</span>
        </div>
        <div style={{ ...slam(921, 8), fontFamily: FONT_HOOK, fontSize: 72, color: RM.amber, textShadow: `0 8px 36px ${RM.amber}44` }}>
          100× COARSER THAN THE OLD MODELS
        </div>
        <div style={{ ...rise(1069, 18), marginTop: 8, fontSize: 30, fontWeight: 500, color: RM.text, textAlign: 'center' }}>
          The mini model runs at 111 × 111 km — coarser still, and it still performs
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default WNHow;
