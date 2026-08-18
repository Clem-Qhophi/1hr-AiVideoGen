import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 89.29-102.73 · the honest caveats. Mythos f98, exploits f214, biology f288.
const Caveat: React.FC<{ head: string; sub: string; style: React.CSSProperties }> = ({ head, sub, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'flex-start', gap: 24, background: RM.panel, border: `1px solid ${RM.red}44`, borderRadius: 16, padding: '22px 36px', width: 1180 }}>
    <div style={{ fontSize: 38, color: RM.red, lineHeight: 1.1 }}>✕</div>
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: RM.text }}>{head}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 27, color: RM.muted, marginTop: 6 }}>{sub}</div>
    </div>
  </div>
);

export const compositionConfig = { id: 'OpHonest', durationInSeconds: 13.5, fps: 30, width: 1920, height: 1080 };

const OpHonest: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(403);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <div style={{ ...rise(6, 16), marginBottom: 8 }}><Eyebrow color={RM.red}>it is not a clean sweep</Eyebrow></div>
        <Caveat head="Behind Mythos 5 on cybersecurity" sub="Anthropic's own comparison on security tasks" style={pop(98)} />
        <Caveat head="Far behind on exploit development" sub="OSS-Fuzz vulnerability exploitation" style={pop(214)} />
        <Caveat head="No frontier gain in biology research" sub="does not advance biology capabilities" style={pop(288)} />
      </AbsoluteFill>
      <div style={{ position: 'absolute', bottom: 34, width: '100%', textAlign: 'center', fontFamily: 'monospace', fontSize: 22, color: RM.muted }}>
        Source: anthropic.com, Jul 2026
      </div>
    </AbsoluteFill>
  );
};
export default OpHonest;
