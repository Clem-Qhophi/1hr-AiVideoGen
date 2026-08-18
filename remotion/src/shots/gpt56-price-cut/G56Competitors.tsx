import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';
import { StatRow } from '../../lib/pricekit';

// master 118.75-160.60 · competitor pricing. Gemini 3.6 Flash f85/220, Flash-Lite f312/376, Opus5 f676/741, verdict f1042/1161.
export const compositionConfig = { id: 'G56Competitors', durationInSeconds: 41.9, fps: 30, width: 1920, height: 1080 };

const G56Competitors: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(1255);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={rise(6, 16)}><Eyebrow>this didn't happen in a vacuum</Eyebrow></div>
        <StatRow name="Gemini 3.6 Flash" value="$9 combined" source="Google" style={pop(85)} />
        <StatRow name="Gemini 3.5 Flash-Lite" value="$2.80 combined" source="Google" style={pop(312)} />
        <StatRow name="Claude Opus 5" value="$30 combined" source="Anthropic, same as 4.8" style={pop(676)} />
        <StatRow name="GPT 5.6 Luna (new)" value="$1.40 combined" source="OpenAI" accent={RM.green} style={pop(741)} />
        <div style={{ ...slam(1042, 8), marginTop: 20, fontFamily: FONT_HOOK, fontSize: 64, color: RM.green, textAlign: 'center' }}>
          UNDERCUTS BOTH GEMINI MODELS
        </div>
        <div style={{ ...rise(1161, 18), fontSize: 30, fontWeight: 600, color: RM.text }}>
          more than 6x cheaper than Gemini 3.6 Flash
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56Competitors;
