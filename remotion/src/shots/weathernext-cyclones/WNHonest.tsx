import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 312.46-360.35 · honest gap. catch f38, open question f160, decision support f460,
// 5yr avg f826, TPU f919, short f1156, decade f1391.
export const compositionConfig = { id: 'WNHonest', durationInSeconds: 47.9, fps: 30, width: 1920, height: 1080 };

const Caveat: React.FC<{ at: number; head: string; sub: string; style?: React.CSSProperties }> = ({ at, head, sub, style }) => {
  const pop = usePop();
  return (
    <div style={{ ...pop(at), display: 'flex', alignItems: 'flex-start', gap: 22, background: RM.panel, border: `1px solid ${RM.red}44`, borderRadius: 16, padding: '18px 32px', width: 1240, ...style }}>
      <div style={{ fontSize: 32, color: RM.red, lineHeight: 1.1 }}>&#10005;</div>
      <div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, color: RM.text }}>{head}</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 24, color: RM.muted, marginTop: 6 }}>{sub}</div>
      </div>
    </div>
  );
};

const WNHonest: React.FC = () => {
  const rise = useRise();
  const drift = useDrift(1437);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.red}>Now the catch — the payoff of the teaser</Eyebrow></div>
        <Caveat at={160} head="The 100× coarser input is an open research question" sub="stated in the paper itself. Nobody fully understands why it works this well." />
        <Caveat at={460} head="Decision support, not the decision" sub="official warnings still come from national agencies, run by human forecasters." />
        <Caveat at={826} head="Intensity in 2025 was genuinely hard" sub="the NHC report: errors above the five-year average." />
        <Caveat at={919} head="1,000-member runs need TPU-class hardware" sub="open source is real access, not zero cost." />
        <Caveat at={1156} head="Short track record" sub="2 years of historical storms + one real season. No model has seen a decade of storms yet." />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default WNHonest;
