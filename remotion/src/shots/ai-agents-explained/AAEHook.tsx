import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 0.0-20.34 · hook-misconception. Cost-framed statement, calm-explainer pacing (slower reveals).
export const compositionConfig = { id: 'AAEHook', durationInSeconds: 20.34, fps: 30, width: 1920, height: 1080 };

const AAEHook: React.FC = () => {
  const rise = useRise();
  const drift = useDrift(610);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(10, 18)}><Eyebrow color={RM.cyan}>AI agents, explained</Eyebrow></div>
        <div style={{ ...rise(40, 20), fontSize: 36, fontWeight: 500, color: RM.text }}>
          Most people think they're using AI well
        </div>
        <div style={{ ...rise(110, 20), fontSize: 28, color: RM.muted }}>
          because they've gotten good at prompts.
        </div>
        <div style={{ ...rise(230, 22), marginTop: 12, fontSize: 42, fontWeight: 700, color: RM.amber, maxWidth: 1100 }}>
          That's costing you real hours every week.
        </div>
        <div style={{ ...rise(400, 20), fontSize: 26, color: RM.muted, maxWidth: 1000 }}>
          Other people get results in minutes that still take you an hour.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AAEHook;
