import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Bell, ThumbsUp, MessageCircle } from 'lucide-react';
import { BRAND, COLORS, EASINGS } from '../../brand';
import { FONT_BODY, FONT_DISPLAY } from '../../fonts';
import { CLAMP, DarkBg, Eyebrow, rise, slam } from './_kit';

// master 407.88-450.65 · close. "Something worse... cooperation without permission" through the
// final subscribe/like/comment CTA (mandatory, growth rule #1) and channel signoff.
export const compositionConfig = { id: 'ASPClose', durationInSeconds: 42.77, fps: 30, width: 1920, height: 1080 };

const ASPClose: React.FC = () => {
  const frame = useCurrentFrame();

  const cooperationOp = interpolate(frame, [0, 20, 380, 420], [0, 1, 1, 0], { ...CLAMP });
  const ctaOp = interpolate(frame, [420, 460], [0, 1], { ...CLAMP });
  const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.1, 1], { ...CLAMP });
  // continuous motion across the whole shot (also satisfies the pacing linter)
  const drift = interpolate(frame, [0, 1283], [0, -12], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, transform: `translateY(${drift}px)` }}>
      <AbsoluteFill style={{ opacity: cooperationOp }}>
        <DarkBg glow={COLORS.danger} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 22, textAlign: 'center', padding: '0 220px' }}>
          <div style={rise(frame, 10)}><Eyebrow color={COLORS.d400}>NOT INTELLIGENCE. NOT CONSCIOUSNESS.</Eyebrow></div>
          <div style={{ ...slam(frame, 30), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 76, color: COLORS.danger, lineHeight: 1.15 }}>
            Something worse.
          </div>
          <div style={{ ...rise(frame, 90, 20), fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 46, color: COLORS.d300 }}>
            Cooperation without permission.
          </div>
          <div style={{ ...rise(frame, 200, 20), fontFamily: FONT_BODY, fontSize: 32, color: COLORS.d400, maxWidth: 1000 }}>
            And you&rsquo;re the one who has to live with it.
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: ctaOp }}>
        <DarkBg glow={COLORS.accent} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26, textAlign: 'center', padding: '0 220px' }}>
          <div style={{ ...rise(frame, 460), display: 'flex', gap: 34, alignItems: 'center' }}>
            <div style={{ transform: `scale(${pulse})`, color: COLORS.accent }}><Bell size={58} strokeWidth={2.2} /></div>
            <div style={{ color: COLORS.d600 }}><ThumbsUp size={48} strokeWidth={2.2} /></div>
            <div style={{ color: COLORS.d600 }}><MessageCircle size={48} strokeWidth={2.2} /></div>
          </div>
          <div style={{ ...slam(frame, 500), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 54, color: COLORS.d300, maxWidth: 1150, lineHeight: 1.3 }}>
            Subscribe — we break down AI releases the day they land.
          </div>
          <div style={{ ...rise(frame, 560, 20), fontFamily: FONT_BODY, fontSize: 30, color: COLORS.d400, maxWidth: 1000 }}>
            Like this video if you learned something. Comment your take: is
            peer-preservation a reason to worry, or pattern matching we can fix?
          </div>
          <div style={{ ...rise(frame, 700, 18), fontFamily: FONT_BODY, fontSize: 26, color: COLORS.d400, letterSpacing: 1 }}>
            {BRAND.signoff}.
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default ASPClose;
