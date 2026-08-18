import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 175.6-190.5 · evidence: who pays. "help center" 191s, Plus $20, Pro $200.
export const compositionConfig = { id: 'G56SolPays', durationInSeconds: 15.0, fps: 30, width: 1920, height: 1080 };

const Card: React.FC<{ tier: string; price: string; accent: string; style: React.CSSProperties; note: string }> = ({ tier, price, accent, style, note }) => (
  <div style={{ ...style, width: 460, background: RM.panel, border: `1px solid ${accent}44`, borderRadius: 20, padding: '30px 34px', textAlign: 'center' }}>
    <div style={{ fontFamily: FONT_HOOK, fontSize: 44, color: accent }}>{tier}</div>
    <div style={{ fontFamily: FONT_HOOK, fontSize: 52, color: RM.text, marginTop: 6 }}>{price}<span style={{ fontSize: 22, color: RM.muted }}> /mo</span></div>
    <div style={{ fontSize: 24, color: RM.muted, marginTop: 10 }}>{note}</div>
  </div>
);

const G56SolPricing: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(450);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.cyan}>who pays · from the openai help center</Eyebrow></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <Card tier="Plus" price="$20" accent={RM.cyan} style={pop(40)} note="reasoning slider + options" />
          <Card tier="Pro" price="$200" accent={RM.green} style={pop(120)} note="full tiers + Sol Pro" />
          <Card tier="Free / Go" price="$0" accent={RM.amber} style={pop(200)} note="Think button on Luna, next week" />
        </div>
        <div style={{ ...rise(260, 16), fontSize: 30, fontWeight: 600, color: RM.text, textAlign: 'center' }}>
          The slider is a paid feature, on a paid model, for paid users.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56SolPricing;