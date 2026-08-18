// AUTO-GENERATED thumbnail shot (tools/gen_thumbnail_tsx.py). Safe to re-generate.
import React from 'react';
import { Thumbnail, type ThumbnailProps } from '../../lib/thumbnail';

export const compositionConfig = {
  id: 'WNCThumb',
  durationInSeconds: 1,
  fps: 30,
  width: 1280,
  height: 720,
};

const props: ThumbnailProps = {"headline": "ONE EXTRA", "emphasis": "DAY", "badge": "NHC CONFIRMED", "accent": "cyan", "variant": "photo", "image": "thumbs/000-hurricane-from-space-satellite-1.jpg", "align": "left", "pos": "center", "focus": "50% 50%", "punch": 1.0, "wordmark": false, "faceCutout": false};

export default function WNCThumb(): React.ReactElement {
  return <Thumbnail {...props} />;
}
