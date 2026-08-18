import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 13.1-33.6 · context. Sept 2024 FDA designation, Musk's claims, then silence.
export const compositionConfig = { id: 'NBSContext', durationInSeconds: 20.5, fps: 30, width: 1920, height: 1080 };

const NBSContext: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(615);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center', padding: '0 160px' }}>
        <div style={pop(20)}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 4, color: RM.cyan, border: `2px solid ${RM.cyan}`, borderRadius: 999, padding: '8px 22px', display: 'inline-block' }}>
            SEPTEMBER 17, 2024
          </div>
        </div>
        <div style={{ ...rise(60, 18), fontSize: 32, fontWeight: 600, color: RM.text, maxWidth: 1100 }}>
          FDA Breakthrough Device Designation for "Blindsight"
        </div>
        <div style={{ ...rise(180, 20), fontSize: 24, color: RM.muted, maxWidth: 1000, marginTop: 6 }}>
          Musk said it could let people who lost both eyes see again.
        </div>
        <div style={{ ...rise(360, 20), fontSize: 24, color: RM.muted, maxWidth: 1000 }}>
          Eventually, infrared and ultraviolet vision — <span style={{ color: RM.text, fontStyle: 'italic' }}>"like Geordi La Forge"</span> from Star Trek.
        </div>
        <div style={{ ...pop(480), fontSize: 34, fontWeight: 700, color: RM.amber, marginTop: 16 }}>
          That got headlines everywhere.
        </div>
        <div style={{ ...rise(555, 18), fontSize: 26, color: RM.red, fontWeight: 600 }}>
          Since then: almost nothing.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default NBSContext;
