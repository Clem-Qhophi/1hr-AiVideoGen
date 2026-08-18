import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 34.36-47.59 · context-2. "went public" f52, "sound, real physics" f156,
// "star in your own clips" f243.
export const compositionConfig = { id: 'SoraContext2', durationInSeconds: 13.23, fps: 30, width: 1920, height: 1080 };

const Step: React.FC<{ at: number; date: string; title: string; color: string }> = ({ at, date, title, color }) => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ ...rise(at, 14), fontFamily: 'monospace', fontSize: 24, letterSpacing: 4, color: RM.muted }}>{date}</div>
      <div style={{ ...slam(at + 12, 9), fontFamily: FONT_HOOK, fontSize: 56, color }}>{title}</div>
    </div>
  );
};

const SoraContext2: React.FC = () => {
  const rise = useRise();
  const drift = useDrift(397);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.cyan}>the timeline</Eyebrow></div>
        <div style={{ display: 'flex', gap: 70, alignItems: 'flex-start', marginTop: 10 }}>
          <Step at={52} date="DEC 2024" title="SORA GOES PUBLIC" color={RM.text} />
          <div style={{ ...rise(100, 16), fontSize: 60, color: RM.line, marginTop: 40 }}>&rarr;</div>
          <Step at={156} date="SEP 2025" title="SORA 2 SHIPS" color={RM.cyan} />
        </div>
        <div style={{ ...rise(243, 18), fontSize: 32, fontWeight: 600, color: RM.muted, maxWidth: 1150 }}>
          Sound, real physics, a social app where you could star in your own clips.
        </div>
        <div style={{ ...rise(320, 18), fontSize: 30, fontWeight: 700, color: RM.text }}>
          OpenAI called that the GPT-3.5 moment for video.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraContext2;
