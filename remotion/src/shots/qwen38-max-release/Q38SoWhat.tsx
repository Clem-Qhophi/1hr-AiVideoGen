import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 136.75-156.75 · so-what-for-builders. "95B number" f393, "live now" f478, "call it today" f572.
export const compositionConfig = { id: 'Q38SoWhat', durationInSeconds: 20.0, fps: 30, width: 1920, height: 1080 };

const Q38SoWhat: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(600);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(6, 16)}><Eyebrow>what it means if you build with this</Eyebrow></div>
        <div style={{ ...rise(30, 18), fontSize: 34, fontWeight: 600, color: RM.text, maxWidth: 1100 }}>
          A flagship-class model, on a fraction of the active compute, that runs unsupervised for over two weeks and still ships something real.
        </div>
        <div style={{ ...rise(393, 18), marginTop: 6, fontSize: 28, color: RM.cyan, fontWeight: 600, maxWidth: 1050 }}>
          Picking a model for a long-running agent, not just a chatbot? That 95B active number is the one to watch.
        </div>
        <div style={{ ...pop(478), marginTop: 18, fontFamily: 'monospace', fontSize: 22, color: RM.green, background: RM.panel, border: `1px solid ${RM.green}44`, borderRadius: 999, padding: '12px 30px' }}>
          ● LIVE NOW &middot; Alibaba Cloud Model Studio
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Q38SoWhat;
