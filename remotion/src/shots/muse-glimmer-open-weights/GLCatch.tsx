import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 251-277 · "catch I promised" f35, GDPVal 1141 v 953 f222, OSWorld 75.6 v 65.9 f370, "trading blows" f709.
export const compositionConfig = { id: 'GLCatch', durationInSeconds: 26.0, fps: 30, width: 1920, height: 1080 };

const GLWinRow: React.FC<{ t: string; a: string; b: string; winner: 'a' | 'b'; f: number }> = ({ t, a, b, winner, f }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [f, f + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ty = interpolate(frame, [f, f + 8], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 30, width: 980, borderBottom: `1px solid ${RM.line}`, padding: '14px 0', opacity: op, transform: `translateY(${ty}px)` }}>
      <div style={{ width: 250, textAlign: 'left', fontSize: 24, color: RM.text, fontWeight: 600 }}>{t}</div>
      <div style={{ width: 160, textAlign: 'right', fontFamily: FONT_HOOK, fontSize: 34, color: winner === 'a' ? RM.amber : RM.muted, textShadow: winner === 'a' ? `0 4px 24px ${RM.amber}44` : undefined }}>{a}</div>
      <div style={{ width: 40, textAlign: 'center', color: RM.muted, fontSize: 22 }}>vs</div>
      <div style={{ width: 160, textAlign: 'left', fontFamily: FONT_HOOK, fontSize: 34, color: winner === 'b' ? RM.amber : RM.muted, textShadow: winner === 'b' ? `0 4px 24px ${RM.amber}44` : undefined }}>{b}</div>
      <div style={{ width: 150, textAlign: 'right', fontSize: 20, color: RM.amber, fontFamily: 'monospace', letterSpacing: 1 }}>
        {winner === 'a' ? 'QWEN WINS' : 'GLIMMER WINS'}
      </div>
    </div>
  );
};

const GLCatch: React.FC = () => {
  const rise = useRise();
  const drift = useDrift(780);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.amber} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(6, 14)}><Eyebrow color={RM.amber}>The catch I promised</Eyebrow></div>
        <div style={{ ...rise(24, 16), fontSize: 30, fontWeight: 600, color: RM.text, marginBottom: 8 }}>
          The one table? Qwen3.6-27B still wins it.
        </div>
        <GLWinRow t="GDPVal (finance)" a="1141" b="953" winner="a" f={120} />
        <GLWinRow t="OSWorld (real PC)" a="75.6" b="65.9" winner="a" f={230} />
        <GLWinRow t="SWE-Bench Verified" a="wins" b="—" winner="a" f={340} />
        <GLWinRow t="TerminalBench" a="wins" b="—" winner="a" f={420} />
        <div style={{ ...rise(540, 18), fontSize: 28, fontWeight: 700, color: RM.text, marginTop: 10 }}>
          &ldquo;Meta beats everything&rdquo; is wrong.
        </div>
        <div style={{ ...rise(620, 18), fontSize: 24, color: RM.muted }}>
          Honest read: trading blows &mdash; and Qwen wins the ones that run real systems.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLCatch;
