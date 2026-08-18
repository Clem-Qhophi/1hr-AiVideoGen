import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { EvidenceBrowser } from '../../lib/evidence';

// Beat 16: Pricing + CTA — 225s-238s (6750f-7140f)
// EvidenceBrowser pricing-page.png + BigStatement CTA
export const compositionConfig = { id: 'RMPricingCTA', durationInSeconds: 13, fps: 30, width: 1920, height: 1080 };

const RMPricingCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing: EASINGS.easeOut });

  // "Founding pricing is locked for life" ~217984ms. Shot starts at 225s = 6750f.
  // (217984 - 225000) is negative. Start from frame 0.
  const browserOp = r(0, 14);

  // CTA overlay: "riskmarshal.com" appears after pricing is shown
  // "Start the trial at riskmarshal.com" ~235521ms. In shot: (235521 - 225000) * 0.03 = ~316f
  const ctaOp = r(310, 330);
  const ctaScale = interpolate(frame, [310, 332], [0.9, 1], { ...CLAMP, easing: EASINGS.overshoot });

  // Pricing highlight: "Core starts at twenty four a month" ~220721ms. In shot: (220721 - 225000) * 0.03 = negative
  // "Pro at forty nine" ~223326ms. In shot: (223326 - 225000) * 0.03 = negative
  // "fourteen day free trial" ~225655ms. In shot: (225655 - 225000) * 0.03 = ~20f
  const trialOp = r(14, 30);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      {/* Browser showing pricing page */}
      <div style={{ opacity: browserOp, position: 'absolute', inset: 0 }}>
        <EvidenceBrowser
          image="projects/review-riskmarshal/evidence/pricing-page-cards.png"
          url="riskmarshal.com/pricing"
          source="Risk Marshal"
          label="PRICING"
          appearAt={0}
          highlight={{ x: 10, y: 10, w: 80, h: 80, startFrame: 10 }}
        />
      </div>

      {/* Trial callout */}
      <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{
          opacity: trialOp,
          background: '#0b1720ee', border: '1px solid #22c55e66', borderRadius: 14,
          padding: '16px 32px',
        }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 28, color: '#22c55e', fontWeight: 600 }}>
            14-day free trial &middot; Both plans
          </span>
        </div>
      </div>

      {/* CTA overlay */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `rgba(7,13,20,${r(300, 330, 0, 0.85)})`,
      }}>
        <div style={{ opacity: ctaOp, transform: `scale(${ctaScale})`, textAlign: 'center' }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 28, letterSpacing: 6, color: '#8ba396', marginBottom: 24 }}>
            START YOUR TRIAL
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: '#22c55e', lineHeight: 1.1 }}>
            riskmarshal.com
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 30, color: '#eaf5ef', marginTop: 20 }}>
            14-day free trial &middot; Locked founding pricing
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default RMPricingCTA;
