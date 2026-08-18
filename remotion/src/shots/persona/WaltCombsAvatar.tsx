// Walt Combs — Forgotten Fix narrator persona avatar. Flat-vector illustration, NOT a photo and
// NOT claimed as one — see channel-persona.home-hacks.json narrator_persona for why (avoids the
// impersonation/fabricated-identity problem the @EliasYoderAmish reference persona ran into).
import React from 'react';

export const compositionConfig = {
  id: 'WaltCombsAvatar',
  durationInSeconds: 1,
  fps: 30,
  width: 1080,
  height: 1080,
};

// Warm homestead palette — deliberately NOT the house indigo/violet brand (brand.md §3b: per-subject
// art direction overrides the default palette; this niche's own style is "warm, domestic, lived-in").
const C = {
  bgOuter: '#f7ecd9',
  bgInner: '#efdcb3',
  skin: '#d7a878',
  skinShade: '#c2926866',
  hair: '#c7c3b6',
  hairShade: '#a8a396',
  beard: '#efe9db',
  beardShade: '#d8d0bd',
  brow: '#a49d8c',
  flannel: '#a8452f',
  flannelLine: '#f3e6d0',
  strap: '#4a3628',
  cap: '#6b5638',
  capBrim: '#4a3826',
  eyeWhite: '#fffdf7',
  pupil: '#3b2b22',
  lineSoft: '#7a5c3e55',
};

export default function WaltCombsAvatar(): React.ReactElement {
  return (
    <svg
      width={1080}
      height={1080}
      viewBox="0 0 1080 1080"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={1080} height={1080} fill={C.bgOuter} />
      <circle cx={540} cy={540} r={480} fill={C.bgInner} />

      {/* shoulders / flannel shirt */}
      <path
        d="M 250 1080 Q 258 830 430 748 L 650 748 Q 822 830 830 1080 Z"
        fill={C.flannel}
      />
      <g clipPath="url(#shoulderClip)" opacity={0.55}>
        <clipPath id="shoulderClip">
          <path d="M 250 1080 Q 258 830 430 748 L 650 748 Q 822 830 830 1080 Z" />
        </clipPath>
        {[820, 870, 920, 970, 1020].map((y) => (
          <line key={`h${y}`} x1={230} y1={y} x2={850} y2={y} stroke={C.flannelLine} strokeWidth={6} />
        ))}
        {[-200, -80, 60, 200, 340, 480].map((off) => (
          <line
            key={`d${off}`}
            x1={540 + off}
            y1={700}
            x2={540 + off + 260}
            y2={1080}
            stroke={C.flannelLine}
            strokeWidth={5}
          />
        ))}
      </g>

      {/* suspenders */}
      <path d="M 448 760 L 420 1080 L 470 1080 L 486 764 Z" fill={C.strap} />
      <path d="M 632 760 L 660 1080 L 610 1080 L 594 764 Z" fill={C.strap} />

      {/* neck */}
      <path d="M 486 680 L 486 780 Q 540 812 594 780 L 594 680 Z" fill={C.skin} />

      {/* ears */}
      <ellipse cx={362} cy={572} rx={26} ry={40} fill={C.skin} />
      <ellipse cx={718} cy={572} rx={26} ry={40} fill={C.skin} />

      {/* head */}
      <ellipse cx={540} cy={556} rx={182} ry={202} fill={C.skin} />
      <ellipse cx={540} cy={650} rx={182} ry={110} fill={C.skinShade} opacity={0.5} />

      {/* side / temple hair (balding on top, gray at the sides — reads "old man" without a fussy hairline) */}
      <path d="M 366 470 Q 350 560 372 620 Q 390 560 388 480 Z" fill={C.hair} />
      <path d="M 714 470 Q 730 560 708 620 Q 690 560 692 480 Z" fill={C.hair} />
      <path d="M 380 430 Q 540 372 700 430 Q 690 400 540 388 Q 390 400 380 430 Z" fill={C.hairShade} opacity={0.55} />

      {/* flat cap */}
      <path d="M 366 444 Q 390 328 540 314 Q 690 328 714 444 Q 622 412 540 412 Q 458 412 366 444 Z" fill={C.cap} />
      <path d="M 366 444 Q 458 420 540 420 Q 622 420 714 444 Q 660 460 540 464 Q 420 460 366 444 Z" fill={C.capBrim} />
      <circle cx={540} cy={332} r={8} fill={C.capBrim} />

      {/* eyebrows */}
      <path d="M 434 486 Q 470 466 508 484" stroke={C.brow} strokeWidth={12} strokeLinecap="round" fill="none" />
      <path d="M 572 484 Q 610 466 646 486" stroke={C.brow} strokeWidth={12} strokeLinecap="round" fill="none" />

      {/* eyes */}
      <ellipse cx={470} cy={520} rx={25} ry={15} fill={C.eyeWhite} />
      <ellipse cx={610} cy={520} rx={25} ry={15} fill={C.eyeWhite} />
      <circle cx={472} cy={521} r={9} fill={C.pupil} />
      <circle cx={608} cy={521} r={9} fill={C.pupil} />
      <path d="M 446 508 Q 470 496 494 508" stroke={C.skinShade} strokeWidth={3} fill="none" />
      <path d="M 586 508 Q 610 496 634 508" stroke={C.skinShade} strokeWidth={3} fill="none" />

      {/* crow's feet — age marker, kept soft */}
      <path d="M 430 522 L 402 512 M 430 530 L 400 534" stroke={C.lineSoft} strokeWidth={3} fill="none" />
      <path d="M 650 522 L 678 512 M 650 530 L 680 534" stroke={C.lineSoft} strokeWidth={3} fill="none" />

      {/* nose */}
      <path d="M 528 512 Q 512 560 520 588 Q 540 602 560 588 Q 568 560 552 512" fill={C.skinShade} opacity={0.35} />
      <path d="M 520 590 Q 540 600 560 590" stroke={C.skinShade} strokeWidth={3} fill="none" />

      {/* beard (behind mouth/mustache) */}
      <path
        d="M 362 590 Q 358 700 440 748 Q 490 772 540 772 Q 590 772 640 748 Q 722 700 718 590 Q 700 660 620 690 Q 660 640 636 600 Q 600 660 540 668 Q 480 660 444 600 Q 420 640 460 690 Q 380 660 362 590 Z"
        fill={C.beard}
      />
      <path d="M 460 700 Q 500 726 540 728 Q 580 726 620 700" stroke={C.beardShade} strokeWidth={4} fill="none" opacity={0.6} />

      {/* mustache */}
      <path
        d="M 478 596 Q 510 578 540 588 Q 570 578 602 596 Q 578 610 540 606 Q 502 610 478 596 Z"
        fill={C.beard}
      />

      {/* mouth sliver — gentle closed smile */}
      <path d="M 508 622 Q 540 636 572 622" stroke="#7a4a36" strokeWidth={5} strokeLinecap="round" fill="none" />
    </svg>
  );
}
