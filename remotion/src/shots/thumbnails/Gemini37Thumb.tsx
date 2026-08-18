// AUTO-GENERATED thumbnail shot (tools/gen_thumbnail_tsx.py). Safe to re-generate.
import React from 'react';
import { Thumbnail, type ThumbnailProps } from '../../lib/thumbnail';

export const compositionConfig = {
  id: 'Gemini37Thumb',
  durationInSeconds: 1,
  fps: 30,
  width: 1280,
  height: 720,
};

const props: ThumbnailProps = {"headline": "65% CODING", "emphasis": "HALF PRICE", "badge": "GEMINI 3.7", "accent": "cyan", "variant": "photo", "image": "projects/gemini-3-7-release/evidence/deepmind-gemini-announcement.png", "align": "left", "pos": "center", "focus": "50% 50%", "punch": 1.0, "wordmark": false, "faceCutout": false};

export default function Gemini37Thumb(): React.ReactElement {
  return <Thumbnail {...props} />;
}
