import React from 'react';
import { useCurrentFrame, interpolate, staticFile } from 'remotion';
import { useSlam, useRise, FONT_HOOK, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// master 37.00-42.10 (153f) SIMULATED FUNDED ACCOUNT.
// "Then progress toward a simulated funded account, (0.49-2.75s local) subject to the program
// rules. (3.01-4.40s)" -- the client-approved legal wording, unchanged from v1's Gate A script.
// Evidence: clean/mobile-platforms.png -- the real TradeLocker/cTrader/MetaTrader5 partner-logo
// row, cropped to exclude the payout-certificate wall and trader-count stats directly below it
// on the live page (claims-register.md rows 1-4).
//
// NOT using qtkit's shared EvidenceBrowser here: its screenshot box is a fixed ~1.95:1 cover-fit
// crop, and this source image is a wide, short strip (860x130, ~6.6:1) -- cover-fit zoomed in so
// far that TradeLocker and MetaTrader got cropped off the sides, leaving only cTrader (see
// out/QTPlatformsV2@f60.png during technical-test QA). A plain contain-fit `<img>` shows the whole
// strip instead. This is a LOCAL component (not imported from qtkit/evidence.tsx) -- same name,
// same purpose (real screenshot + source citation in a browser-chrome frame), different fit
// strategy for a wide/short crop. Keep the name: tools/check_deliverable.py's evidence-density
// check (Growth Rule #3) greps shot source for `<Evidence(Frame|Browser)` to count real screenshots
// on screen, so an unnamed one-off component would under-count actual evidence in this video.
const EvidenceFrame: React.FC<{ image: string; url: string; label: string; source: string; appearAt: number }> = ({ image, url, label, source, appearAt }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [appearAt, appearAt + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y = interpolate(frame, [appearAt, appearAt + 14], [24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ opacity: op, transform: `translateY(${y}px)`, width: 820, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 1, color: QT.accent2, marginBottom: 10 }}>
        <span>{label}</span>
        <span style={{ color: QT.muted }}>{source}</span>
      </div>
      <div style={{ border: `1px solid ${QT.line}`, borderRadius: 16, overflow: 'hidden', background: '#0d0d0d' }}>
        <div style={{ height: 48, background: QT.panel, display: 'flex', alignItems: 'center', gap: 8, padding: '0 18px', borderBottom: `1px solid ${QT.line}` }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
          <div style={{ flex: 1, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 16, color: QT.muted }}>{url}</div>
        </div>
        <img src={staticFile(image)} style={{ width: '100%', display: 'block' }} />
      </div>
    </div>
  );
};

export const compositionConfig = { id: 'QTPlatformsV2', durationInSeconds: 5.1, fps: 30, width: 1080, height: 1920 };

const QTPlatformsV2: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ ...rise(10), marginTop: 150, fontSize: 44, fontWeight: 600, color: QT.muted }}>
          Then progress toward a
        </div>
        <div style={{ ...slam(40, 9), marginTop: 14, fontFamily: FONT_HOOK, fontSize: 76, lineHeight: 1.08, color: QT.accent }}>
          SIMULATED FUNDED
          <br />
          ACCOUNT
        </div>
        <div style={{ ...rise(95, 14), marginTop: 18, fontSize: 34, fontWeight: 500, color: QT.muted }}>
          Subject to the program rules.
        </div>
        {/* pinned well above the caption safe zone (captions render bottom-anchored, pad_bottom
            384px -> occupy roughly y 1430-1560 on a 1920 canvas) -- a v1 EMISSION bug: this
            collided with the caption line until caught in the post-bake frame QA pass, since a
            single-shot technical-test render never composites the caption overlay. */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1010 }}>
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
export default QTPlatformsV2;
