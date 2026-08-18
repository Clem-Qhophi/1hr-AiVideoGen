import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 331.89-350.81 · honest-4: deletion nuance + the word "if". "not total" f38,
// "permanently deleted" f136, "sora.chatgpt.com/sunset" f252, "word if is doing real work" f517.
export const compositionConfig = { id: 'SoraHonest4', durationInSeconds: 18.92, fps: 30, width: 1920, height: 1080 };

const SoraHonest4: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(568);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.red}>THE FINE PRINT</Eyebrow></div>
        <div style={{ ...rise(38, 18), fontSize: 34, fontWeight: 600, color: RM.text }}>
          The deletion is not total. Not yet.
        </div>
        <div style={{ ...rise(136, 18), fontSize: 34, color: RM.muted, maxWidth: 1250 }}>
          OpenAI says it will &ldquo;permanently delete&rdquo; remaining Sora content after the export window.
        </div>
        <div style={{ ...rise(252, 16), fontFamily: 'monospace', fontSize: 30, color: RM.cyan, background: '#0d1117ee', border: `2px solid ${RM.cyan}55`, borderRadius: 14, padding: '12px 30px' }}>
          sora.chatgpt.com/sunset
        </div>
        <div style={{ ...rise(400, 18), fontSize: 32, color: RM.muted, maxWidth: 1250 }}>
          The actual page says &ldquo;if we are able to offer one&rdquo;. That &ldquo;if&rdquo; is doing real work.
        </div>
        <div style={{ ...slam(517, 10), fontFamily: FONT_HOOK, fontSize: 44, color: RM.amber }}>
          Plan like there&apos;s a window, act like it closes early.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraHonest4;
