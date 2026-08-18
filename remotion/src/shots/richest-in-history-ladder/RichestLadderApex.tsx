import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Arena3DBackdrop, AuctionGavelTicker } from '../../lib/comparisonkit';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';

export const compositionConfig = {
  id: 'RichestLadderApex',
  durationInSeconds: 75,
  fps: 30,
  width: 1920,
  height: 1080,
};

const RichestLadderApex: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Arena3DBackdrop primaryGlow={COLORS.accent} secondaryGlow={COLORS.warn} accentTitle="LEVEL 10 — THE ALL-TIME APEX CHAMPION" />
      <AuctionGavelTicker
        currentBidder="MANSA MUSA (EMPEROR OF MALI)"
        bidderColor={COLORS.accent}
        startValue={250000000000}
        endValue={400000000000}
        currencyPrefix="$"
        statusText="THE RICHEST HUMAN IN HISTORY"
        gavelStrikeFrame={80}
        startFrame={0}
        duration={80}
      />
    </AbsoluteFill>
  );
};

export default RichestLadderApex;
