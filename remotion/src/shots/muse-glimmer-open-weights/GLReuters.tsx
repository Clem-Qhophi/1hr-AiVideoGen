import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 240-251 · "rogue-agent breach" f133. HF platform breach + Reuters capture-blocked disclosure.
export const compositionConfig = { id: 'GLReuters', durationInSeconds: 11.0, fps: 30, width: 1920, height: 1080 };

const GLReuters: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(330);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(6, 14)}><Eyebrow color={RM.red}>In case you missed it</Eyebrow></div>
        <div style={{ ...slam(18, 10), fontFamily: FONT_HOOK, fontSize: 54, lineHeight: 1.05, color: RM.red, textShadow: `0 8px 36px ${RM.red}44` }}>
          HUGGING FACE = THE PLATFORM<br />IN THE ROGUE-AGENT BREACH
        </div>
        <div style={{ ...rise(110, 18), fontSize: 26, color: RM.muted, maxWidth: 1000 }}>
          The same platform these weights live on. That&rsquo;s why open-weight security is suddenly mainstream.
        </div>
        <div style={{ ...rise(200, 18), fontFamily: 'monospace', fontSize: 20, color: RM.amber, border: `1px solid ${RM.amber}44`, borderRadius: 12, padding: '14px 24px', maxWidth: 1050 }}>
          &ldquo;Reuters, Aug 10 2026&rdquo; &mdash; our screenshot capture was blocked by the site&rsquo;s bot protection. The claim is sourced from the report text.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLReuters;
