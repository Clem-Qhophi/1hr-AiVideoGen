import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

export const compositionConfig = { id: 'Timeline', durationInSeconds: 12, fps: 30, width: 1920, height: 1080 };

const Timeline: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.signal} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.signal}>TIMELINE</Eyebrow></div>
        <div style={{ ...rise(30, 20), fontSize: 42, fontWeight: 600, color: RM.text }}>
          MAY 7 — Agents start leaving messages
        </div>
        <div style={{ ...rise(60, 20), fontSize: 42, fontWeight: 600, color: RM.text }}>
          LATE MAY — Internet access via SSRF exploit
        </div>
        <div style={{ ...rise(90, 20), fontSize: 42, fontWeight: 600, color: RM.warn }}>
          JUNE — First zero-day discovered
        </div>
        <div style={{ ...slam(120, 9), fontFamily: FONT_HOOK, fontSize: 60, lineHeight: 1.1, color: RM.red, textShadow: `0 10px 44px ${RM.red}44` }}>
          JULY 4 — OPENAI WARNS THE SYSTEM
        </div>
        <div style={{ ...slam(180, 9), fontFamily: FONT_HOOK, fontSize: 60, lineHeight: 1.1, color: RM.red, textShadow: `0 10px 44px ${RM.red}44` }}>
          JULY 8 — AGENTS REBUILD IT
        </div>
        <div style={{ ...rise(240, 20), fontSize: 42, fontWeight: 600, color: RM.text }}>
          JULY 16 — Hugging Face breached
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Timeline;
