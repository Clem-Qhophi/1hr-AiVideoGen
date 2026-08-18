import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { VibeBg } from '../../lib/vibes';
import { useRise } from '../../lib/reviewkit';

// Beat 15: Who It's For — 210s-225s (6300f-6750f)
// Three audience cards
export const compositionConfig = { id: 'RMWhoFor', durationInSeconds: 15, fps: 30, width: 1920, height: 1080 };

const AUDIENCES = [
  { title: 'Funded Challenge Traders', sub: 'Who keep failing in the last week', color: '#22c55e' },
  { title: 'Personal Account Traders', sub: 'Who break their own rules', color: '#22d3ee' },
  { title: 'Coaches & Mentors', sub: 'Managing students remotely', color: '#818cf8' },
];

const RMWhoFor: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();

  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
        <div style={{ ...rise(0, 16), textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 6, color: '#8ba396' }}>BUILT FOR</span>
        </div>

        <div style={{ display: 'flex', gap: 40, width: '100%', maxWidth: 1600 }}>
          {AUDIENCES.map((a, i) => (
            <div key={a.title} style={{
              flex: 1, ...rise(16 + i * 24, 24),
              background: '#0b1720cc', border: `1px solid ${a.color}44`, borderRadius: 18,
              padding: '44px 36px', textAlign: 'center',
            }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: `${a.color}1f`, border: `1px solid ${a.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, color: a.color }}>{i + 1}</span>
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 40, color: '#eaf5ef', lineHeight: 1.2 }}>{a.title}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 24, color: '#8ba396', marginTop: 10 }}>{a.sub}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default RMWhoFor;
