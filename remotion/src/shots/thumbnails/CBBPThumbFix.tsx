// AUTO-GENERATED thumbnail shot (tools/gen_thumbnail_tsx.py). Safe to re-generate.
import React from 'react';
import { Thumbnail, type ThumbnailProps } from '../../lib/thumbnail';

export const compositionConfig = {
  id: 'CBBPThumbFix',
  durationInSeconds: 1,
  fps: 30,
  width: 1280,
  height: 720,
};

const props: ThumbnailProps = {"headline": "STILL RUNS", "emphasis": "NO GENERATOR", "accent": "cyan", "variant": "photo", "image": "thumbs/000-car-parked-driveway-storm-night-1.jpg", "align": "left", "pos": "center", "focus": "20% 40%", "punch": 1.0, "wordmark": false, "face": "persona/walt-combs-cutout.png", "faceAt": [90.0, 58.0], "faceCutout": true};

export default function CBBPThumbFix(): React.ReactElement {
  return <Thumbnail {...props} />;
}
