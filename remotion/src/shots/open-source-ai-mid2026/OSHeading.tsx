import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RMBg, useRise } from '../../lib/reviewkit';

// master 119.5-141.0 · "trajectory" f16 · open weights behind/cheap f40 · closed keep ceiling f250 · "basically free" f410
export const compositionConfig = { id: 'OSHeading', durationInSeconds: 21.5, fps: 30, width: 1920, height: 1080 };

const Row: React.FC<{ at: number; k: string; kc: string; children: React.ReactNode }> = ({ at, k, kc, children }) => {
  const rise = useRise();
  return (
    <div style={{ ...rise(at, 24), display: 'flex', gap: 26, alignItems: 'baseline', width: 1180 }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 30, fontWeight: 700, color: kc, minWidth: 150 }}>{k}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 46, fontWeight: 500, color: COLORS.paper, lineHeight: 1.2 }}>{children}</div>
    </div>
  );
};

const OSHeading: React.FC = () => {
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={COLORS.accent} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
        <div style={{ ...rise(8, 18), fontFamily: FONT_MONO, fontSize: 28, letterSpacing: 6, color: COLORS.d400 }}>WHERE IT IS HEADING</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          <Row at={40} k="OPEN" kc={COLORS.signal}>A few months behind. Permissive. Cheap.</Row>
          <Row at={250} k="CLOSED" kc={COLORS.accent}>Keeps the ceiling and the hardest agentic work.</Row>
        </div>
        <div style={{ ...rise(410, 26), marginTop: 18, fontSize: 58, fontWeight: 700, color: COLORS.paper, textAlign: 'center' }}>
          Near frontier intelligence is now <span style={{ color: COLORS.signal }}>basically free</span>.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default OSHeading;
