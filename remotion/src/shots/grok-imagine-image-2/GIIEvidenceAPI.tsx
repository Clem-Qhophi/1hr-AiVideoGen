import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceBrowser } from '../../lib/evidence';
import { CLAMP } from '../../lib/kit';
import { EASINGS } from '../../brand';
import { RM, FONT_HOOK, useDrift } from '../../lib/reviewkit';

// master 277.73-301.97 · evidence-6: the API. "Image 2.0 is app-only right now" f184,
// "developer access in the coming days" f251, "$0.02 standard / $0.05 quality" f342-458,
// "API takes three reference images, app takes five" f588-648, "the gap is real, for now" f680.
export const compositionConfig = { id: 'GIIEvidenceAPI', durationInSeconds: 24.24, fps: 30, width: 1920, height: 1080 };

const Chip: React.FC<{ text: string; color: string; at: number; hideAt?: number; font?: number }> = ({ text, color, at, hideAt, font = 38 }) => {
  const frame = useCurrentFrame();
  const op =
    interpolate(frame, [at, at + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }) *
    (hideAt ? 1 - interpolate(frame, [hideAt - 12, hideAt], [0, 1], { ...CLAMP, easing: EASINGS.easeIn }) : 1);
  if (op <= 0) return null;
  const sc = interpolate(frame, [at, at + 14], [1.3, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{
      position: 'absolute', bottom: 54, left: '50%', transform: `translateX(-50%) scale(${sc})`,
      opacity: op, fontFamily: FONT_HOOK, fontSize: font, color,
      background: '#0d1117ee', border: `2px solid ${color}66`, borderRadius: 16,
      padding: '12px 38px', textAlign: 'center', whiteSpace: 'nowrap',
    }}>{text}</div>
  );
};

const GIIEvidenceAPI: React.FC = () => {
  const drift = useDrift(727);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <AbsoluteFill style={drift}>
        <EvidenceBrowser
          image="projects/grok-imagine-image-2/evidence/xai-api-pricing.png"
          url="docs.x.ai/developers/pricing"
          source="docs.x.ai pricing page, Aug 2026"
          label="THE API"
          appearAt={0}
        />
      </AbsoluteFill>
      <Chip text="Image 2.0: app-only right now" color={RM.amber} at={184} hideAt={330} font={34} />
      <Chip text="API: $0.02 standard · $0.05 quality" color={RM.cyan} at={342} hideAt={580} />
      <Chip text="3 reference images (API) vs 5 (app)" color={RM.text} at={588} hideAt={665} font={34} />
      <Chip text="the gap is real, for now" color={RM.red} at={680} font={36} />
    </AbsoluteFill>
  );
};
export default GIIEvidenceAPI;
