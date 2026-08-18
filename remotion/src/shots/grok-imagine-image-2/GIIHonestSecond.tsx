import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, RM, FONT_HOOK } from '../../lib/reviewkit';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';

// master 328.78-338.07 · honest-gap 2: still second. "it's still second" f25,
// "leads by sixty points on text-to-image" f108, "twenty-four on editing" f170,
// "closed the gap. didn't erase it" f216-254.
export const compositionConfig = { id: 'GIIHonestSecond', durationInSeconds: 9.29, fps: 30, width: 1920, height: 1080 };

const GIIHonestSecond: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(279);
  const t2i = interpolate(frame, [108, 150], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const edit = interpolate(frame, [170, 205], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 200px', textAlign: 'center' }}>
        <div style={{ ...rise(6, 16), fontSize: 30, fontWeight: 600, color: RM.muted }}>
          Second:
        </div>
        <div style={{ ...slam(25, 9), fontFamily: FONT_HOOK, fontSize: 96, color: RM.text }}>
          IT&rsquo;S STILL SECOND
        </div>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 18, width: 950 }}>
          <div style={{ opacity: t2i, display: 'flex', alignItems: 'center', gap: 24, fontFamily: FONT_HOOK, fontSize: 32 }}>
            <div style={{ color: RM.muted, width: 300, textAlign: 'right' }}>text-to-image</div>
            <div style={{ width: 300, height: 30, borderRadius: 10, background: RM.panel, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, t2i * 40)}%`, height: '100%', background: RM.red }} />
            </div>
            <div style={{ color: RM.red, width: 240, textAlign: 'left' }}>60 pts behind</div>
          </div>
          <div style={{ opacity: edit, display: 'flex', alignItems: 'center', gap: 24, fontFamily: FONT_HOOK, fontSize: 32 }}>
            <div style={{ color: RM.muted, width: 300, textAlign: 'right' }}>image editing</div>
            <div style={{ width: 300, height: 30, borderRadius: 10, background: RM.panel, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, edit * 20)}%`, height: '100%', background: RM.red }} />
            </div>
            <div style={{ color: RM.red, width: 240, textAlign: 'left' }}>24 pts behind</div>
          </div>
        </div>
        <div style={{ ...rise(216, 18), fontSize: 30, fontWeight: 700, color: RM.green }}>
          xAI closed the gap.
        </div>
        <div style={{ ...rise(254, 18), fontSize: 30, fontWeight: 700, color: RM.red }}>
          They didn&rsquo;t erase it.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIHonestSecond;
