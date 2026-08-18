// AUTO-GENERATED thumbnail shot (tools/gen_thumbnail_tsx.py). Safe to re-generate.
import React from 'react';
import { Thumbnail, type ThumbnailProps } from '../../lib/thumbnail';

export const compositionConfig = {
  id: 'CRNAThumbC',
  durationInSeconds: 1,
  fps: 30,
  width: 1280,
  height: 720,
};

const props: ThumbnailProps = {"headline": "DRY AIR", "emphasis": "ONLY", "accent": "orange", "variant": "photo", "image": "thumbs/057-very-hot-dry-climate-desert-1.jpg", "align": "left", "pos": "center", "focus": "40% 50%", "punch": 1.0, "wordmark": false, "face": "persona/walt-combs-cutout.png", "faceAt": [82.0, 100.0], "faceCutout": true};

export default function CRNAThumbC(): React.ReactElement {
  return <Thumbnail {...props} />;
}
