import React from 'react';
import { AbsoluteFill } from 'remotion';
import { RMBgLive, RM } from '../../lib/reviewkit';

// Not a video beat — the SOURCE for scripts/bake-backgrounds.mjs, which renders one still per glow
// colour into media/library/backgrounds/. Always draws the LIVE gradient stack (RMBgLive), never
// the baked PNG, or the baker would be photocopying its own output.
export const compositionConfig = {
  id: 'BrandBg',
  durationInSeconds: 1,
  fps: 30,
  width: 1920,
  height: 1080,
  defaultProps: { glow: RM.cyan as string },
};

const BrandBg: React.FC<{ glow?: string }> = ({ glow = RM.cyan }) => (
  <AbsoluteFill>
    <RMBgLive glow={glow} />
  </AbsoluteFill>
);
export default BrandBg;
