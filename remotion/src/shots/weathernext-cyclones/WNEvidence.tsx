import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, RM } from '../../lib/reviewkit';
import { EvidenceFrame } from '../../lib/evidence';

// master 157.03-223.67 · evidence. blog f72, 100km f248, 11kt f426, report f628, 12-72h f885,
// east pacific f944, 48-120h f1069, toolbox f1297, all-time highs f1489, 2nd-highest f1848.
export const compositionConfig = { id: 'WNEvidence', durationInSeconds: 66.6, fps: 30, width: 1920, height: 1080 };

// slow ken-burns on a full-frame element (keeps long evidence holds alive)
const Zoomer: React.FC<{ children: React.ReactNode; frames: number }> = ({ children, frames }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, frames], [1.0, 1.06], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ transform: `scale(${z})` }}>{children}</AbsoluteFill>;
};

const Pill: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [at, at + 10], [0, 1]);
  if (frame < at) return null;
  return (
    <div style={{
      position: 'absolute', bottom: 130, left: '50%', transform: 'translateX(-50%)',
      opacity: op, background: RM.panel, border: `1px solid ${RM.cyan}66`, borderRadius: 16,
      padding: '14px 30px', fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 28, color: RM.text,
      textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,.4)', maxWidth: 1500,
    }}>
      {children}
    </div>
  );
};

const WNEvidence: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      {/* paper numbers, then the report */}
      <Zoomer frames={556}>
        <EvidenceFrame
          image="projects/weathernext-cyclones/evidence/deepmind-blog.png"
          source="Google DeepMind blog, Aug 6 2026"
          label="THE PAPER'S BENCHMARK PLOTS"
          appearAt={72}
          scale={1}
        />
      </Zoomer>
      <Zoomer frames={1999}>
        <EvidenceFrame
          image="projects/weathernext-cyclones/evidence/nhc-verification-2025.png"
          source="NHC 2025 Verification Report, NOAA · Mar 30 2026"
          label="THE NHC'S OWN VERIFICATION REPORT"
          appearAt={628}
          scale={1}
        />
      </Zoomer>
      <Pill at={248}>3-day track error ≈ <b style={{ color: RM.cyan }}>100 km</b> · better than the European model</Pill>
      <Pill at={426}>Intensity error ≈ <b style={{ color: RM.cyan }}>11 knots</b> · beats the US Navy's hurricane model</Pill>
      <Pill at={885}>Outperformed the NHC's official forecasts at 12–72 h on track</Pill>
      <Pill at={1069}>Eastern Pacific: beat every model and consensus at 48–120 h</Pill>
      <Pill at={1297}>Already in the forecasters' toolbox last season</Pill>
      <Pill at={1489}>2025 track skill hit near all-time highs — the AI beat that bar</Pill>
      <Pill at={1848}>2025: 13 storms, 5 hurricanes, 3 Category 5s — 2nd most on record</Pill>
    </AbsoluteFill>
  );
};
export default WNEvidence;
