import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, CLAMP } from '../../lib/reviewkit';
import { EvidenceBrowser } from '../../lib/evidence';
import { EASINGS } from '../../brand';

// master 58.0-87.4 · verdict pt2 (THE CENTRAL PROOF). Neuralink's own site: Active / Active / Upcoming.
export const compositionConfig = { id: 'NBSEvidenceTrialStatus', durationInSeconds: 29.4, fps: 30, width: 1920, height: 1080 };

const NBSEvidenceTrialStatus: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(882);
  const frame = useCurrentFrame();
  const bottomOp = interpolate(frame, [785, 799], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift }}>
        <div style={{ position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', ...rise(20, 14) }}>
          <Eyebrow color={RM.cyan}>check this yourself, right now</Eyebrow>
        </div>

        <EvidenceBrowser
          image="projects/neuralink-blindsight-silence/evidence/neuralink-trials-status.png"
          url="neuralink.com/trials"
          source="Neuralink's own site, live"
          label="21 PARTICIPANTS ACTIVE — VISION: UPCOMING"
          appearAt={60}
          scale={0.86}
          highlight={{ x: 0, y: 33, w: 78, h: 24, startFrame: 655 }}
        />

        <div style={{
          position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', opacity: bottomOp,
        }}>
          <span style={{ fontSize: 46, fontWeight: 800, color: RM.red }}>16 months. </span>
          <span style={{ fontSize: 26, color: RM.muted }}>Since the FDA fast-tracked it. Still not launched.</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default NBSEvidenceTrialStatus;
