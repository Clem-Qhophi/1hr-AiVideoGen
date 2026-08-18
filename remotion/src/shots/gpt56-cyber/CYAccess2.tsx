import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 255.0-280.3 · the access reality from the Daybreak page.
// "Blue ... general model market" f100, "Red ... hardware security keys" f220, "proving who you are" f475,
// "approved operators only" f560, "legal rights to attack" f680.
export const compositionConfig = { id: 'CYAccess2', durationInSeconds: 25.3, fps: 30, width: 1920, height: 1080 };

const CYAccess2: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(759);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '0 120px', textAlign: 'center' }}>
        <div style={rise(3, 12)}><Eyebrow color={RM.cyan}>The access reality &middot; Daybreak page</Eyebrow></div>
        <div style={{ display: 'flex', gap: 34, marginTop: 14 }}>
          <div style={{ ...pop(90, 12), width: 560, background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 18, padding: '28px 36px' }}>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 60, color: RM.green }}>BLUE</div>
            <div style={{ fontSize: 26, fontWeight: 500, color: RM.text, marginTop: 10 }}>Daybreak members</div>
            <div style={{ fontSize: 24, color: RM.muted, marginTop: 4 }}>+ the general model market</div>
          </div>
          <div style={{ ...pop(220, 12), width: 560, background: RM.panel, border: `1px solid ${RM.red}55`, borderRadius: 18, padding: '28px 36px' }}>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 60, color: RM.red }}>RED</div>
            <div style={{ fontSize: 26, fontWeight: 500, color: RM.text, marginTop: 10 }}>where Cyber lives</div>
            <div style={{ fontSize: 22, color: RM.muted, marginTop: 8, textAlign: 'left', lineHeight: 1.5 }}>
              &bull; Daybreak account<br />&bull; identity verification<br />&bull; hardware security keys &middot; from Sept 1
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 18 }}>
          <div style={{ ...rise(440, 16), fontSize: 30, fontWeight: 700, color: RM.text }}>You won&rsquo;t get an account by paying.</div>
          <div style={{ ...rise(475, 16), fontSize: 30, fontWeight: 700, color: RM.amber }}>You&rsquo;ll get one by proving who you are.</div>
        </div>
        <div style={{ ...rise(560, 16), marginTop: 6, fontFamily: FONT_HOOK, fontSize: 40, color: RM.green }}>
          &ldquo;APPROVED OPERATORS ONLY&rdquo;
        </div>
        <div style={{ ...rise(620, 16), fontSize: 26, fontWeight: 500, color: RM.muted, marginTop: 4 }}>
          OpenAI verifies those operators&rsquo; legal rights to attack their targets.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYAccess2;
