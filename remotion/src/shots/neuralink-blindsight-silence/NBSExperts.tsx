import React from 'react';
import { AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, CLAMP } from '../../lib/reviewkit';
import { EASINGS, COLORS, RADIUS, SHADOW } from '../../brand';

// master 111.1-138.75 · verdict pt4. Named experts on record: Ione Fine (UW), Philip Troyk (Illinois Tech).
export const compositionConfig = { id: 'NBSExperts', durationInSeconds: 27.65, fps: 30, width: 1920, height: 1080 };

const Quote: React.FC<{ name: string; org: string; text: string; style: React.CSSProperties; accent?: string }> = ({ name, org, text, style, accent = RM.cyan }) => (
  <div style={{ ...style, maxWidth: 1020, borderLeft: `4px solid ${accent}`, paddingLeft: 24 }}>
    <div style={{ fontSize: 26, color: RM.text, lineHeight: 1.5, fontStyle: 'italic' }}>"{text}"</div>
    <div style={{ marginTop: 10, fontFamily: FONT_MONO, fontSize: 17, letterSpacing: 2, color: accent }}>
      {name.toUpperCase()} — {org.toUpperCase()}
    </div>
  </div>
);

const NBSExperts: React.FC = () => {
  const rise = useRise();
  const drift = useDrift(830);
  const frame = useCurrentFrame();
  const imgOp = interpolate(frame, [10, 24], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, padding: '0 130px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 40 }}>
        <div style={rise(0, 14)}><Eyebrow color={RM.cyan}>independent experts, on the record</Eyebrow></div>
        <Quote name="Ione Fine" org="University of Washington" style={{ opacity: interpolate(frame, [119, 133], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }) }}
          text="Neuralink will build the best cortical implant we can build with current technology. It will not produce anything like normal vision." />
        <Quote accent={RM.amber} name="Philip Troyk" org="Illinois Institute of Technology" style={{ opacity: interpolate(frame, [592, 606], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }) }}
          text="At best, this becomes something that helps you alongside a cane and a guide dog. Not something that replaces them." />
      </AbsoluteFill>

      <div style={{
        position: 'absolute', right: 60, bottom: 60, width: 300, opacity: imgOp,
        borderRadius: RADIUS.card, overflow: 'hidden', border: `2px solid ${COLORS.d600}`,
        boxShadow: SHADOW.card, background: COLORS.paper,
      }}>
        <Img src={staticFile('projects/neuralink-blindsight-silence/evidence/ieee-spectrum-headline.png')}
          style={{ width: '100%', height: 170, objectFit: 'cover', objectPosition: '0 0' }} />
        <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: RM.muted, padding: '8px 10px' }}>
          IEEE Spectrum · Sep 27, 2024
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default NBSExperts;
