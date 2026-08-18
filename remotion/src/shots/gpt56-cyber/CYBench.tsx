import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 186.5-205.0 · benchmark math. "simulated-attack environment" f100, completion f200,
// success f250, average f310, zero-day eval f440.
export const compositionConfig = { id: 'CYBench', durationInSeconds: 18.5, fps: 30, width: 1920, height: 1080 };

const BenchRow: React.FC<{ f: number; label: string; val: string }> = ({ f, label, val }) => {
  const pop = usePop();
  return (
    <div style={{ ...pop(f, 12), width: 1160, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 34px', borderRadius: 14, background: RM.panel, border: `1px solid ${RM.line}` }}>
      <div style={{ fontSize: 28, fontWeight: 600, color: RM.text }}>{label}</div>
      <div style={{ fontFamily: FONT_HOOK, fontSize: 34, color: RM.green }}>{val}</div>
    </div>
  );
};

const CYBench: React.FC = () => {
  const rise = useRise();
  const drift = useDrift(555);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 120px', textAlign: 'center' }}>
        <div style={rise(3, 12)}><Eyebrow color={RM.cyan}>First &middot; the benchmark math</Eyebrow></div>
        <div style={{ ...rise(34, 16), fontSize: 30, fontWeight: 500, color: RM.text, marginBottom: 10 }}>
          ExploitGym &middot; OpenAI&rsquo;s own simulated-attack environment
        </div>
        <BenchRow f={160} label="Completion rate" val="BEATS BOTH" />
        <BenchRow f={230} label="Success rate" val="BEATS BOTH" />
        <BenchRow f={300} label="Average success" val="BEATS BOTH" />
        <div style={{ ...rise(440, 18), marginTop: 14, width: 1160, textAlign: 'center', fontSize: 28, fontWeight: 700, color: RM.amber }}>
          Zero-day finding eval: higher-severity findings, better calibration &mdash; than either baseline
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYBench;
