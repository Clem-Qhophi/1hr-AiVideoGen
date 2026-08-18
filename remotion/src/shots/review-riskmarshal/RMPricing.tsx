import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_MONO } from '../../fonts';
import { RM, useRise } from '../../lib/reviewkit';
import { EvidenceBrowser } from '../../lib/evidence';

// master 58.3-64.3 · real pricing screenshot; caption reveals at f42 ("$24") / f141 ("14-day")
export const compositionConfig = { id: 'RMPricing', durationInSeconds: 6.3, fps: 30, width: 1920, height: 1080 };

const RMPricing: React.FC = () => {
  const rise = useRise();
  return (
    <AbsoluteFill style={{ backgroundColor: RM.bg0 }}>
      <EvidenceBrowser
        image="projects/review-riskmarshal/evidence/pricing-cards.png"
        url="riskmarshal.com/pricing"
        label="PRICING"
        appearAt={2}
      />
      <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18 }}>
        <span style={{ ...rise(42, 20), fontFamily: FONT_MONO, fontSize: 30, color: RM.text, background: RM.panel, border: `1px solid ${RM.cyan}66`, borderRadius: 999, padding: '14px 28px' }}>
          Core <span style={{ color: RM.cyan }}>$24/mo</span>  ·  Pro <span style={{ color: RM.cyan }}>$49/mo</span>
        </span>
        <span style={{ ...rise(141, 20), fontFamily: FONT_MONO, fontSize: 30, color: RM.text, background: RM.panel, border: `1px solid ${RM.green}66`, borderRadius: 999, padding: '14px 28px' }}>
          <span style={{ color: RM.green }}>14-day free trial</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
export default RMPricing;
