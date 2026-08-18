import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ArenaBg, CommentaryBar, WordmarkShot, Combatant, CLAMP } from '../../lib/dataleague';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// DLVerdict — the fair verdict: glory vs volume, belt handover, poll CTA, sign-off.
export const compositionConfig = { id: 'DLVerdict', durationInSeconds: 38.4, fps: 30, width: 1920, height: 1080 };

const MESSI: Combatant = { id: 'messi', name: 'Lionel Messi', short: 'MESSI', color: '#5BB8F0' };
const RONALDO: Combatant = { id: 'ronaldo', name: 'Cristiano Ronaldo', short: 'RONALDO', color: '#E8475F' };

const Fade: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [at, at + 12], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });
  return <AbsoluteFill style={{ opacity: out }}>{children}</AbsoluteFill>;
};

const Rise: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [at, at + 12], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  return <AbsoluteFill style={{ opacity: rise }}>{children}</AbsoluteFill>;
};

const Panel: React.FC<{ color: string; title: string; list: string; left?: boolean }> = ({ color, title, list, left }) => (
  <div style={{
    width: 700, borderRadius: RADIUS.card, border: `2px solid ${color}66`, background: `${COLORS.d900}cc`,
    padding: '30px 36px', textAlign: left ? 'left' : 'right',
  }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 44, color, lineHeight: 1 }}>{title}</div>
    <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.muted, marginTop: 16, letterSpacing: 1 }}>{list}</div>
  </div>
);

const VerdictScene: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [at, at + 12], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  return (
    <AbsoluteFill style={{ opacity: rise, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 38, color: COLORS.muted, letterSpacing: 8, marginBottom: 26 }}>THE VERDICT</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 46, marginBottom: 40 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 90, fontWeight: 700, color: RONALDO.color }}>5</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 60, color: COLORS.accent }}>-</div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 90, fontWeight: 700, color: MESSI.color }}>4</div>
      </div>
      <div style={{ display: 'flex', gap: 30 }}>
        <Panel color={MESSI.color} title="MESSI OWNS THE GLORY" list="WORLD CUP · BALLON D'OR · ASSISTS · EFFICIENCY" left />
        <Panel color={RONALDO.color} title="RONALDO OWNS THE VOLUME" list="GOALS · MONEY · FAME · HAT-TRICKS" />
      </div>
    </AbsoluteFill>
  );
};

const BeltCard: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [at, at + 12], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  const scale = interpolate(frame, [at, at + 12], [0.7, 1], { ...CLAMP, easing: EASINGS.overshoot });
  return (
    <AbsoluteFill style={{ opacity: rise, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 30, transform: `scale(${scale})`,
        border: `2px solid ${COLORS.accent}`, borderRadius: RADIUS.card, padding: '34px 60px',
        background: `${COLORS.d900}e6`, boxShadow: `0 0 60px ${COLORS.accent}33`,
      }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', border: `8px solid ${COLORS.accent}`, boxShadow: `0 0 30px ${COLORS.accent}66` }} />
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 56, color: COLORS.accent, lineHeight: 1 }}>THE BELT: RONALDO</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 24, color: COLORS.muted, marginTop: 10, letterSpacing: 2 }}>HE WILL DEFEND IT. YOU PICK THE CONTENDER.</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PollCard: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [at, at + 12], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  return (
    <AbsoluteFill style={{ opacity: rise, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 84, color: COLORS.ink, lineHeight: 1 }}>WHO FIGHTS NEXT?</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 26, color: COLORS.warn, letterSpacing: 4, marginTop: 20 }}>COMMENT YOUR PICK</div>
      <div style={{ display: 'flex', gap: 18, marginTop: 40 }}>
        {["M'BAPPÉ", 'HAALAND', 'NEYMAR', 'OTHER'].map((name) => (
          <div key={name} style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: COLORS.muted, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.pill, padding: '10px 26px', background: `${COLORS.d900}cc` }}>
            {name}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const DLVerdict: React.FC = () => (
  <AbsoluteFill>
    <ArenaBg glowA={MESSI.color} glowB={RONALDO.color} />
    <Fade at={687}>
      <VerdictScene at={5} />
    </Fade>
    <Rise at={687}>
      <Fade at={935}>
        <BeltCard at={687} />
      </Fade>
    </Rise>
    <Rise at={935}>
      <Fade at={1096}>
        <PollCard at={935} />
      </Fade>
    </Rise>
    <Rise at={1096}>
      <WordmarkShot subtitle="AND THE NUMBERS HAVE SPOKEN" start={1096} />
    </Rise>
    <CommentaryBar text="The numbers have spoken. And they are fair." start={5} exit={103} />
    <CommentaryBar text="The data says both won. Only one gets the belt." start={566} exit={646} />
  </AbsoluteFill>
);
export default DLVerdict;
