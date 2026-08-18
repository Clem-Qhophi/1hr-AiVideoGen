import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 218-240 · "live on Hugging Face today" f0, "coming days" f66, Ollama/LM Studio f180+.
export const compositionConfig = { id: 'GLRollout', durationInSeconds: 22.0, fps: 30, width: 1920, height: 1080 };

const GLRollout: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const pop = usePop();
  const drift = useDrift(660);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(6, 14)}><Eyebrow color={RM.cyan}>Rollout</Eyebrow></div>
        <div style={{ ...slam(16, 10), fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 44, lineHeight: 1.1, color: RM.green }}>
          Weights live on Hugging Face <span style={{ fontSize: 56 }}>TODAY</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          {[
            { t: 'vLLM &bull; SGLang &mdash; day one', f: 100 },
            { t: 'llama.cpp &bull; MLX &bull; ExecuTorch &mdash; coming days', f: 190 },
            { t: 'Ollama &bull; LM Studio &mdash; coming', f: 300 },
          ].map((c) => (
            <div key={c.t} style={{ ...pop(c.f), fontFamily: 'monospace', fontSize: 26, letterSpacing: 1, color: RM.text, border: `2px solid ${RM.line}`, borderRadius: 999, padding: '12px 32px', background: `${RM.cyan}10` }}>
              {c.t}
            </div>
          ))}
        </div>
        <div style={{ ...rise(430, 18), fontSize: 24, color: RM.amber, fontFamily: 'monospace' }}>
          &ldquo;Coming days&rdquo; in Meta-speak = weeks. They said it, we&rsquo;re just repeating it.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLRollout;
