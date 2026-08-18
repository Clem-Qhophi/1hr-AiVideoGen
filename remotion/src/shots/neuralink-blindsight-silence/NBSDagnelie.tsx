import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';
import { EvidenceFrame } from '../../lib/evidence';

// master 232.2-254.3 · evidence pt3 (payoff line). Gislin Dagnelie (Johns Hopkins): "trust us, we're Neuralink."
export const compositionConfig = { id: 'NBSDagnelie', durationInSeconds: 22.1, fps: 30, width: 1920, height: 1080 };

const NBSDagnelie: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(663);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift }}>
        <div style={{ position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', ...rise(10, 14) }}>
          <Eyebrow color={RM.cyan}>IEEE Spectrum, peer-reviewed engineering press</Eyebrow>
        </div>
        <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', ...rise(267, 18) }}>
          <div style={{ fontSize: 24, color: RM.text }}>Gislin Dagnelie — vision scientist, Johns Hopkins</div>
          <div style={{ fontSize: 18, color: RM.muted, marginTop: 4 }}>He's run multiple implant trials himself.</div>
        </div>

        <EvidenceFrame
          image="projects/neuralink-blindsight-silence/evidence/ieee-spectrum-headline.png"
          source="IEEE Spectrum, Sep 27, 2024"
          appearAt={55}
          scale={0.5}
        />

        <div style={{
          position: 'absolute', bottom: 90, left: 0, right: 0, textAlign: 'center', padding: '0 150px', ...pop(560),
        }}>
          <div style={{ fontSize: 46, fontWeight: 800, color: RM.amber }}>"Trust us, we're Neuralink."</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default NBSDagnelie;
