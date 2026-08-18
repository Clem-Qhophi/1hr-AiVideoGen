import React from 'react';
import { useCurrentFrame, interpolate, staticFile } from 'remotion';
import { useSlam, useRise, FONT_HOOK, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// 1:1 adaptation of QTPlatformsV2 -- SAME cue frames, compact stack for 1080x1080. Contain-fit
// local EvidenceFrame (not qtkit's EvidenceBrowser) -- same reason as the 9:16/16:9 versions:
// mobile-platforms.png is a wide/short strip that cover-fit crops badly.
const EvidenceFrame: React.FC<{ image: string; url: string; label: string; source: string; appearAt: number }> = ({ image, url, label, source, appearAt }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [appearAt, appearAt + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y = interpolate(frame, [appearAt, appearAt + 14], [24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ opacity: op, transform: `translateY(${y}px)`, width: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_MONO, fontSize: 16, letterSpacing: 1, color: QT.accent2, marginBottom: 8 }}>
        <span>{label}</span>
        <span style={{ color: QT.muted }}>{source}</span>
      </div>
      <div style={{ border: `1px solid ${QT.line}`, borderRadius: 14, overflow: 'hidden', background: '#0d0d0d' }}>
        <div style={{ height: 40, background: QT.panel, display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px', borderBottom: `1px solid ${QT.line}` }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
          <div style={{ flex: 1, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 13, color: QT.muted }}>{url}</div>
        </div>
        <img src={staticFile(image)} style={{ width: '100%', display: 'block' }} />
      </div>
    </div>
  );
};

// master 37.00-42.10 (153f) SIMULATED FUNDED ACCOUNT.
export const compositionConfig = { id: 'QTPlatformsV211', durationInSeconds: 5.1, fps: 30, width: 1080, height: 1080 };

const QTPlatformsV211: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ ...rise(10), marginTop: 60, fontSize: 34, fontWeight: 600, color: QT.muted }}>
          Then progress toward a
        </div>
        <div style={{ ...slam(40, 9), marginTop: 10, fontFamily: FONT_HOOK, fontSize: 58, lineHeight: 1.08, color: QT.accent, padding: '0 40px' }}>
          SIMULATED FUNDED
          <br />
          ACCOUNT
        </div>
        <div style={{ ...rise(95, 14), marginTop: 12, fontSize: 26, fontWeight: 500, color: QT.muted }}>
          Subject to the program rules.
        </div>
        {/* well clear of the caption safe zone -- same lesson as the other aspects. */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 590 }}>
          <EvidenceFrame
            image="projects/qt-funded-ad/evidence/clean/mobile-platforms.png"
            url="qtfunded.quanttekel.com/evaluations"
            label="REAL TRADING PLATFORMS"
            source="qtfunded.quanttekel.com, Aug 2026"
            appearAt={20}
          />
        </div>
      </div>
    </div>
  );
};
export default QTPlatformsV211;
