// The Forgotten Fix — YouTube channel banner. 2048x1152, safe area (visible on all devices) is
// the centered 1235x338 box: x 406.5-1641.5, y 407-745. Wordmark/tagline/avatar all sit inside it;
// only decorative background extends into the desktop/TV-only margins.
import React from 'react';
import { Img, staticFile } from 'remotion';

export const compositionConfig = {
  id: 'ForgottenFixBanner',
  durationInSeconds: 1,
  fps: 30,
  width: 2048,
  height: 1152,
};

const C = {
  bgTop: '#f7ecd9',
  bgBottom: '#e8cf9e',
  ink: '#3a2c1c',
  muted: '#6b5638',
  ring: '#eeddb8',
};

export default function ForgottenFixBanner(): React.ReactElement {
  return (
    <svg
      width={2048}
      height={1152}
      viewBox="0 0 2048 1152"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.bgTop} />
          <stop offset="100%" stopColor={C.bgBottom} />
        </linearGradient>
      </defs>
      <rect width={2048} height={1152} fill="url(#bg)" />

      {/* soft decorative rings, desktop/TV-only margin - kept clear of the safe zone */}
      <circle cx={140} cy={980} r={260} fill={C.ring} opacity={0.5} />
      <circle cx={1950} cy={140} r={220} fill={C.ring} opacity={0.5} />

      {/* safe-zone content: wordmark + tagline (left) + photo badge (right), all within
          x 406-1642, y 407-745. Avatar starts at x=1370, so text block is capped ~880px wide. */}
      <text
        x={440}
        y={505}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight={700}
        fontSize={62}
        letterSpacing={1}
        fill={C.ink}
      >
        THE FORGOTTEN FIX
      </text>
      <text
        x={440}
        y={560}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontSize={27}
        fill={C.muted}
      >
        The old fixes that worked before
      </text>
      <text
        x={440}
        y={596}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontSize={27}
        fill={C.muted}
      >
        there was a $200 gadget for it.
      </text>
      <line x1={440} y1={630} x2={1160} y2={630} stroke={C.muted} strokeWidth={2} opacity={0.5} />
      <text
        x={440}
        y={672}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={26}
        fill={C.muted}
      >
        New videos most weeks
      </text>

      <circle cx={1500} cy={576} r={140} fill="#fff" />
      <clipPath id="avatarClip">
        <circle cx={1500} cy={576} r={130} />
      </clipPath>
      <g clipPath="url(#avatarClip)">
        <image
          href={staticFile('persona/walt-combs-photo.jpg')}
          x={1370}
          y={446}
          width={260}
          height={260}
          preserveAspectRatio="xMidYMid slice"
        />
      </g>
    </svg>
  );
}
