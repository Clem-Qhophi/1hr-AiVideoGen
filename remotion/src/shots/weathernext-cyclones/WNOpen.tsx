import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';
import { EvidenceBrowser } from '../../lib/evidence';

// master 285.40-312.46 · open data. bigquery f93, weather lab f147, github f200, 30 countries f480,
// philippines f586, pacific f728.
export const compositionConfig = { id: 'WNOpen', durationInSeconds: 27.1, fps: 30, width: 1920, height: 1080 };

const Chip: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const pop = usePop();
  return (
    <div style={{ ...pop(at), background: `${RM.panel}e6`, border: `1px solid ${RM.green}55`, borderRadius: 14, padding: '12px 26px', fontSize: 24, fontWeight: 500, color: RM.text }}>
      {children}
    </div>
  );
};

const WNOpen: React.FC = () => {
  const rise = useRise();
  const drift = useDrift(812);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.green} />
      <EvidenceBrowser
        image="projects/weathernext-cyclones/evidence/github-repo.png"
        url="github.com/google-deepmind/weathernext"
        source="GitHub, Aug 2026"
        label="THE OPEN-SOURCE RELEASE"
        appearAt={200}
        scale={0.78}
      />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 60 }}>
        <div style={{ ...rise(93, 18), fontSize: 32, fontWeight: 500, color: RM.text, background: `${RM.panel}cc`, borderRadius: 14, padding: '10px 26px', marginBottom: 10 }}>
          Forecast data on <span style={{ fontFamily: FONT_HOOK, color: RM.cyan }}>BigQuery + Earth Engine</span>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', width: 1600 }}>
          <Chip at={147}>Weather Lab: free live visualizer</Chip>
          <Chip at={480}>NHC serves ~30 countries</Chip>
          <Chip at={586}>Philippines · PAGASA</Chip>
          <Chip at={620}>Taiwan · CWA</Chip>
          <Chip at={654}>Indonesia · BMKG</Chip>
          <Chip at={688}>Vietnam · VNMHA</Chip>
        </div>
        <div style={{ ...rise(728, 18), marginTop: 12, fontSize: 28, fontWeight: 600, color: RM.text, background: `${RM.panel}cc`, borderRadius: 14, padding: '10px 26px' }}>
          From the Atlantic into the Pacific, with real partners.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default WNOpen;
