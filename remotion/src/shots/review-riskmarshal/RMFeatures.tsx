import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Check } from 'lucide-react';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RM, RMBg, useRise } from '../../lib/reviewkit';

// master 52.0-58.3 · profit-lock f9 · lot-sizing f48 · partner f87
export const compositionConfig = { id: 'RMFeatures', durationInSeconds: 6.5, fps: 30, width: 1920, height: 1080 };

const ITEMS = [
  { at: 9, title: 'Daily profit lock', sub: 'lock green days so the afternoon can’t undo the morning' },
  { at: 48, title: 'Smart lot sizing', sub: 'every trade sized to your risk, automatically' },
  { at: 87, title: 'Accountability partner', sub: 'a coach who sees every breach' },
];

const Item: React.FC<{ at: number; title: string; sub: string }> = ({ at, title, sub }) => {
  const rise = useRise();
  return (
    <div style={{ ...rise(at, 24), display: 'flex', alignItems: 'center', gap: 26 }}>
      <div style={{ width: 54, height: 54, borderRadius: 14, background: `${RM.green}1f`, border: `1px solid ${RM.green}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Check size={30} color={RM.green} strokeWidth={3} />
      </div>
      <div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 52, color: RM.text, lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontSize: 30, color: RM.muted, marginTop: 4 }}>{sub}</div>
      </div>
    </div>
  );
};

const RMFeatures: React.FC = () => {
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.green} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 44, padding: '0 300px' }}>
        <div style={{ ...rise(2, 16), fontFamily: FONT_MONO, fontSize: 28, letterSpacing: 6, color: RM.muted }}>AND MORE IN THE BOX</div>
        {ITEMS.map((it) => <Item key={it.title} {...it} />)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default RMFeatures;
