import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 67.67-89.23 · 16-day autonomous coding run. "16 days" f118, "265 commits" f282, "127 PRs" f356, "oh-my-cli" f524.
export const compositionConfig = { id: 'Q38Coding16Day', durationInSeconds: 21.56, fps: 30, width: 1920, height: 1080 };

const Stat: React.FC<{ value: string; label: string; style: React.CSSProperties }> = ({ value, label, style }) => (
  <div style={{ ...style, textAlign: 'center' }}>
    <div style={{ fontFamily: FONT_HOOK, fontSize: 68, color: RM.cyan, textShadow: `0 8px 30px ${RM.cyan}44` }}>{value}</div>
    <div style={{ fontFamily: 'monospace', fontSize: 17, color: RM.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1.5 }}>{label}</div>
  </div>
);

const Q38Coding16Day: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(647);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>autonomous coding &middot; no human touch</Eyebrow></div>
        <div style={{ ...slam(118, 9), fontFamily: FONT_HOOK, fontSize: 110, color: RM.text, lineHeight: 0.95 }}>16 DAYS</div>
        <div style={{ ...rise(150, 16), fontSize: 26, color: RM.muted }}>building a coding tool from an empty folder</div>
        <div style={{ display: 'flex', gap: 60, marginTop: 20 }}>
          <Stat value="265" label="commits" style={pop(282)} />
          <Stat value="127" label="PRs merged" style={pop(356)} />
          <Stat value="151" label="issues" style={pop(400)} />
        </div>
        <div style={{ ...rise(524, 18), marginTop: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 22, color: RM.green, background: RM.panel, border: `1px solid ${RM.green}44`, borderRadius: 999, padding: '10px 24px' }}>
            oh-my-cli &middot; open source on GitHub
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Q38Coding16Day;
