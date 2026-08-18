import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 84.2-107.5 · the four-row leaderboard table.
// Cyber 95% f100, Sol 1.5% f351, Blue 2% f456, GPT-5.5 57.3% f543, "This is the jump." f687.
export const compositionConfig = { id: 'CYTable', durationInSeconds: 23.3, fps: 30, width: 1920, height: 1080 };

const Row: React.FC<{ f: number; name: string; tag: string; value: string; highlight?: boolean }> = ({ f, name, tag, value, highlight }) => {
  const rise = useRise();
  const vs = highlight ? RM.cyan : RM.text;
  return (
    <div style={{ ...rise(f, 14), width: 1180, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 40px', borderRadius: 14, background: highlight ? `${RM.cyan}18` : RM.panel, border: `1px solid ${highlight ? `${RM.cyan}66` : RM.line}` }}>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontFamily: FONT_HOOK, fontSize: 34, color: RM.text }}>{name}</div>
        <div style={{ fontSize: 22, color: RM.muted, marginTop: 2 }}>{tag}</div>
      </div>
      <div style={{ fontFamily: FONT_HOOK, fontSize: 56, color: vs, textShadow: highlight ? `0 10px 40px ${RM.cyan}44` : undefined }}>{value}</div>
    </div>
  );
};

const CYTable: React.FC = () => {
  const rise = useRise();
  const drift = useDrift(699);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 120px' }}>
        <div style={rise(3, 12)}><Eyebrow color={RM.cyan}>ExploitGym &middot; OpenAI simulation benchmark</Eyebrow></div>
        <div style={{ ...rise(30, 16), fontSize: 34, fontWeight: 600, color: RM.text, marginBottom: 14 }}>
          Completion rate on advanced cyber attack tasks
        </div>
        <Row f={100} name="GPT-5.6-Cyber" tag="offensive build &middot; this release" value="95.0%" highlight />
        <Row f={240} name="GPT-5.5-Cyber" tag="previous cyber model" value="57.3%" />
        <Row f={420} name="GPT-5.6 Sol &middot; Daybreak Blue" tag="defenders&rsquo; build" value="2.0%" />
        <Row f={540} name="GPT-5.6 Sol &middot; standard" tag="standard safeguards" value="1.5%" />
        <div style={{ ...rise(640, 18), marginTop: 18, fontFamily: FONT_HOOK, fontSize: 52, color: RM.amber }}>
          THIS IS THE JUMP.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYTable;
