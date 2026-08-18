import React from 'react';
import { useCurrentFrame, interpolate, staticFile } from 'remotion';
import { useSlam, useRise, FONT_HOOK, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// 16:9 adaptation of QTPlatformsV2 -- SAME cue frames. Row/split layout: headline left, evidence
// right. Contain-fit local EvidenceFrame (not qtkit's EvidenceBrowser) -- same reason as the 9:16
// version: mobile-platforms.png is a wide/short strip that cover-fit crops badly.
const EvidenceFrame: React.FC<{ image: string; url: string; label: string; source: string; appearAt: number; width: number }> = ({ image, url, label, source, appearAt, width }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [appearAt, appearAt + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y = interpolate(frame, [appearAt, appearAt + 14], [24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ opacity: op, transform: `translateY(${y}px)`, width }}>
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

// master 37.00-42.10 (153f) SIMULATED FUNDED ACCOUNT.
export const compositionConfig = { id: 'QTPlatformsV2169', durationInSeconds: 5.1, fps: 30, width: 1920, height: 1080 };

const QTPlatformsV2169: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', left: 80, top: '50%', transform: 'translateY(-50%)', width: 780 }}>
        <div style={{ ...rise(10), fontSize: 38, fontWeight: 600, color: QT.muted }}>
          Then progress toward a
        </div>
        <div style={{ ...slam(40, 9), marginTop: 10, fontFamily: FONT_HOOK, fontSize: 68, lineHeight: 1.08, color: QT.accent }}>
          SIMULATED FUNDED
          <br />
          ACCOUNT
        </div>
        <div style={{ ...rise(95, 14), marginTop: 14, fontSize: 30, fontWeight: 500, color: QT.muted }}>
          Subject to the program rules.
        </div>
      </div>
      <div style={{ position: 'absolute', right: 90, top: '50%', transform: 'translateY(-50%)' }}>
        <EvidenceFrame
          image="projects/qt-funded-ad/evidence/clean/mobile-platforms.png"
          url="qtfunded.quanttekel.com/evaluations"
          label="REAL TRADING PLATFORMS"
          source="qtfunded.quanttekel.com, Aug 2026"
          appearAt={20}
          width={700}
        />
      </div>
    </div>
  );
};
export default QTPlatformsV2169;
