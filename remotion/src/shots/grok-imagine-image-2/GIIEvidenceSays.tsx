import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';
import { EvidenceBackdrop } from '../../lib/evidence';

// master 301.97-310.00 · evidence-7: what the evidence says. serious release f48,
// ranked #2 in the world f91, editing-first f147, priced like a utility f168, "once the API lands" f196.
export const compositionConfig = { id: 'GIIEvidenceSays', durationInSeconds: 8.03, fps: 30, width: 1920, height: 1080 };

const POINTS = [
  { t: 'A serious release', s: 48, c: RM.text },
  { t: 'Ranked #2 in the world', s: 91, c: RM.cyan },
  { t: 'Editing-first', s: 147, c: RM.green },
  { t: 'Priced like a utility, once the API lands', s: 168, c: RM.amber },
];

const GIIEvidenceSays: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(241);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <EvidenceBackdrop image="projects/grok-imagine-image-2/evidence/arena-t2i-overall.png" dim={0.86} frames={241} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 200px', textAlign: 'center' }}>
        <div style={rise(4, 16)}><Eyebrow color={RM.cyan}>So here&rsquo;s what the evidence says</Eyebrow></div>
        {POINTS.map((p) => (
          <div key={p.t} style={{ ...pop(p.s), display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 30, color: p.c }}>✓</div>
            <div style={{ fontSize: 34, fontWeight: 700, color: p.c }}>{p.t}</div>
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIEvidenceSays;
