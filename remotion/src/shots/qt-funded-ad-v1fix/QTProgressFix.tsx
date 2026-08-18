import React from 'react';
import { useCurrentFrame, interpolate, staticFile } from 'remotion';
import { useSlam, useRise, usePop, FONT_HOOK, QTEyebrow, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// COPY of qt-funded-ad/QTProgress.tsx with ONE change: programs.png (the QT Instant pricing grid,
// with drawdown/profit-split numbers and a "55% off + free half-size account, code QT" banner
// repeated on every card -- all unapproved, see videos/qt-funded-ad/work/v1-audit-report.md)
// replaced with clean/mobile-platforms.png (the real TradeLocker/cTrader/MetaTrader5 partner-logo
// row, zero performance/pricing numbers). Positioned higher than v1's evFrame(1000) to also clear
// the caption safe zone (a collision bug caught and fixed on qt-funded-ad-v2, same lesson applied
// here pre-emptively). Timing UNCHANGED.
//
// NOT using qtkit's shared EvidenceBrowser: its screenshot box is a fixed ~1.95:1 cover-fit crop,
// and mobile-platforms.png is a wide/short strip (860x230, ~3.7:1) -- cover-fit cropped TradeLocker
// and MetaTrader off the sides, leaving only cTrader (caught in post-bake frame QA on the v1fix
// contact sheet -- the exact bug already fixed on qt-funded-ad-v2's QTPlatformsV2, reapplied here).
// A plain contain-fit `<img>` shows the whole strip instead.
const EvidenceFrame: React.FC<{ image: string; url: string; label: string; source: string; appearAt: number }> = ({ image, url, label, source, appearAt }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [appearAt, appearAt + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y = interpolate(frame, [appearAt, appearAt + 14], [24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ opacity: op, transform: `translateY(${y}px)`, width: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_MONO, fontSize: 18, letterSpacing: 1, color: QT.accent2, marginBottom: 10 }}>
        <span>{label}</span>
        <span style={{ color: QT.muted }}>{source}</span>
      </div>
      <div style={{ border: `1px solid ${QT.line}`, borderRadius: 16, overflow: 'hidden', background: '#0d0d0d' }}>
        <div style={{ height: 44, background: QT.panel, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', borderBottom: `1px solid ${QT.line}` }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          <div style={{ flex: 1, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 14, color: QT.muted }}>{url}</div>
        </div>
        <img src={staticFile(image)} style={{ width: '100%', display: 'block' }} />
      </div>
    </div>
  );
};

// master 17.80-23.00 (156f) THE PATH. "Then progress toward (19.45) a simulated funded account (20.07)
// subject to the program rules. (22.20)"
export const compositionConfig = { id: 'QTProgressFix', durationInSeconds: 5.2, fps: 30, width: 1080, height: 1920 };

const QTProgressFix: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const pop = usePop();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <QTEyebrow style={{ ...rise(3), marginTop: 170 }}>THE PATH</QTEyebrow>
        <div style={{ ...rise(20, 16), marginTop: 22, fontSize: 44, fontWeight: 500, color: QT.muted }}>
          progress toward a
        </div>
        <div style={{ ...slam(46, 9), marginTop: 12, fontFamily: FONT_HOOK, fontSize: 92, lineHeight: 1.04, color: QT.accent, textShadow: '0 10px 40px rgba(154,255,209,.2)' }}>
          SIMULATED
          <br />
          FUNDED ACCOUNT
        </div>
        <div style={{ ...pop(128), marginTop: 22, border: `1px solid ${QT.line}`, borderRadius: 999, padding: '14px 34px', background: QT.panel, fontSize: 28, fontWeight: 600, color: QT.muted }}>
          subject to the program rules
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 940 }}>
          <EvidenceFrame
            image="projects/qt-funded-ad/evidence/clean/mobile-platforms.png"
            url="qtfunded.quanttekel.com"
            label="REAL TRADING PLATFORMS"
            source="qtfunded.quanttekel.com, Aug 2026"
            appearAt={6}
          />
        </div>
      </div>
    </div>
  );
};
export default QTProgressFix;
