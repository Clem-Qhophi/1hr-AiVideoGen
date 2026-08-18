import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 33.6-58.0 · verdict pt1. What "Breakthrough Device Designation" means, and doesn't - FDA's own words.
export const compositionConfig = { id: 'NBSDesignation', durationInSeconds: 24.4, fps: 30, width: 1920, height: 1080 };

const NBSDesignation: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(732);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, textAlign: 'center', padding: '0 150px' }}>
        <div style={rise(10, 16)}><Eyebrow color={RM.cyan}>what the designation actually means</Eyebrow></div>

        <div style={{ display: 'flex', gap: 40, marginTop: 6 }}>
          <div style={{ ...pop(130), display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 30, color: RM.red, fontWeight: 800 }}>✕</span>
            <span style={{ fontSize: 26, color: RM.text }}>FDA approval</span>
          </div>
          <div style={{ ...pop(190), display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 30, color: RM.red, fontWeight: 800 }}>✕</span>
            <span style={{ fontSize: 26, color: RM.text }}>proof it works</span>
          </div>
        </div>
        <div style={{ ...pop(250), fontSize: 30, fontWeight: 700, color: RM.amber }}>
          It's a fast lane. That's it.
        </div>

        <div style={{
          ...rise(400, 20), marginTop: 20, maxWidth: 1050, padding: '24px 34px',
          border: `2px solid ${RM.line}`, borderRadius: 14, background: RM.panel,
        }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 18, letterSpacing: 3, color: RM.cyan, marginBottom: 10 }}>FDA, ON THE RECORD</div>
          <div style={{ fontSize: 26, color: RM.text, lineHeight: 1.5, fontStyle: 'italic' }}>
            "Novel, and worth studying faster."
          </div>
        </div>

        <div style={{ display: 'flex', gap: 40, marginTop: 10 }}>
          <div style={{ ...pop(560), fontSize: 24, color: RM.red, fontWeight: 600 }}>Does NOT mean safe.</div>
          <div style={{ ...pop(610), fontSize: 24, color: RM.red, fontWeight: 600 }}>Does NOT mean effective.</div>
        </div>
        <div style={{ ...rise(720, 18), fontSize: 22, color: RM.muted, maxWidth: 950 }}>
          Those still have to be proven — in real trials, on real people.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default NBSDesignation;
