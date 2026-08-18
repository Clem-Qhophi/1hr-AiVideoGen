import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 61.6-84.2 · one lab, two answers. "same security question" f90, 1.5% f210, Blue 2% f317,
// Cyber 95% f391, "a policy choice, baked into the weights." f595.
export const compositionConfig = { id: 'CYSplit', durationInSeconds: 22.6, fps: 30, width: 1920, height: 1080 };

const Pod: React.FC<{ label: string; sub: string; value: string; color: string; glow: string; f: number }> = ({
  label, sub, value, color, glow, f,
}) => {
  const pop = usePop();
  return (
    <div style={{ ...pop(f, 12), width: 400, background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 18, padding: '26px 30px 30px' }}>
      <div style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: 2, color: RM.muted }}>{label}</div>
      <div style={{ fontFamily: FONT_HOOK, fontSize: 108, lineHeight: 1, color, textShadow: `0 10px 40px ${glow}44`, marginTop: 8 }}>{value}</div>
      <div style={{ fontSize: 24, fontWeight: 500, color: RM.text, marginTop: 8 }}>{sub}</div>
    </div>
  );
};

const CYSplit: React.FC = () => {
  const rise = useRise();
  const drift = useDrift(678);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 120px', textAlign: 'center' }}>
        <div style={rise(3, 12)}><Eyebrow color={RM.cyan}>The same security question</Eyebrow></div>
        <div style={{ ...rise(40, 16), fontSize: 38, fontWeight: 700, color: RM.text, marginTop: 4 }}>
          For the <span style={{ fontFamily: FONT_HOOK }}>first time</span>, one lab ships two answers.
        </div>
        <div style={{ display: 'flex', gap: 34, marginTop: 22 }}>
          <Pod label="SOL &middot; STANDARD SAFEGUARDS" sub="refuses most attack chains" value="1.5%" color={RM.text} glow={RM.cyan} f={210} />
          <Pod label="SOL &middot; DAYBREAK BLUE" sub="defenders&rsquo; build" value="2.0%" color={RM.green} glow={RM.green} f={317} />
          <Pod label="GPT-5.6-CYBER" sub="the offensive build" value="95%" color={RM.cyan} glow={RM.cyan} f={391} />
        </div>
        <div style={{ ...rise(520, 18), marginTop: 20, fontSize: 34, fontWeight: 700, color: RM.amber, maxWidth: 1200 }}>
          That gap is not engineering noise.
        </div>
        <div style={{ ...rise(565, 18), fontSize: 34, fontWeight: 700, color: RM.amber, maxWidth: 1200 }}>
          It is a <span style={{ fontFamily: FONT_HOOK }}>policy choice</span>, baked into the weights.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYSplit;
