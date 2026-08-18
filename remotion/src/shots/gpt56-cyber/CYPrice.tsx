import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { EvidenceBrowser } from '../../lib/evidence';
import { useDrift } from '../../lib/reviewkit';

// master 205.0-222.9 · pricing evidence. "captured today" f115, "$12.50 in" f138, "$75 out" f218,
// "skipping a smoke test" f414.
export const compositionConfig = { id: 'CYPrice', durationInSeconds: 17.9, fps: 30, width: 1920, height: 1080 };

const CYPrice: React.FC = () => {
  const drift = useDrift(537, 1.0, 1.03);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY, ...drift }}>
      <EvidenceBrowser
        image="projects/gpt56-cyber/evidence/model-page-pricing.png"
        url="developers.openai.com/api/docs/models/gpt-5.6-cyber"
        source="OpenAI API docs &middot; Aug 11, 2026"
        label="THE PRICE &middot; CAPTURED"
        appearAt={0}
        scale={0.86}
      />
      {/* solid annotation pill, kept clear of the bottom caption bar (EVOLUTION) */}
      <div style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 912,
        background: '#0d1117', border: '1px solid #30363d', borderRadius: 999,
        padding: '14px 32px', fontSize: 26, letterSpacing: 1, fontFamily: FONT_MONO, color: '#c9d1d9',
      }}>
        API pricing &middot; per 1M tokens &mdash; <span style={{ color: '#f5c451' }}>$12.50 in</span> / <span style={{ color: '#34d399' }}>$75 out</span>
      </div>
    </AbsoluteFill>
  );
};
export default CYPrice;
