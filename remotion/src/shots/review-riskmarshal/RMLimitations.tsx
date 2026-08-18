import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { VibeBg } from '../../lib/vibes';
import { useRise } from '../../lib/reviewkit';

// Beat 14: Honest Limitations — 195s-210s (5850f-6300f)
// BigStatement: MT5 only, still early, won't fix a bad strategy
export const compositionConfig = { id: 'RMLimitations', durationInSeconds: 15, fps: 30, width: 1920, height: 1080 };

const ITEMS = [
  { text: 'MT5 only right now', icon: '\u2717' },
  { text: 'Still early in beta', icon: '\u2717' },
  { text: 'Won\u2019t fix a bad strategy', icon: '\u2717' },
];

const RMLimitations: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();

  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 200px', textAlign: 'center' }}>
        <div style={{ ...rise(0, 16) }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 6, color: '#8ba396', display: 'block', marginBottom: 36 }}>
            HONEST LIMITATIONS
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%', maxWidth: 900 }}>
          {ITEMS.map((item, i) => (
            <div key={item.text} style={{ ...rise(20 + i * 30, 24),
              display: 'flex', alignItems: 'center', gap: 24,
              background: '#0b1720cc', border: '1px solid #232b36', borderRadius: 14,
              padding: '24px 36px',
            }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 36, color: '#f5c451' }}>{item.icon}</span>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 44, color: '#eaf5ef' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default RMLimitations;
