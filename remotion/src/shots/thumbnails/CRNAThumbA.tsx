// AUTO-GENERATED thumbnail shot (tools/gen_thumbnail_tsx.py). Safe to re-generate.
import React from 'react';
import { Thumbnail, type ThumbnailProps } from '../../lib/thumbnail';

export const compositionConfig = {
  id: 'CRNAThumbA',
  durationInSeconds: 1,
  fps: 30,
  width: 1280,
  height: 720,
};

const props: ThumbnailProps = {"headline": "IT WORKS", "emphasis": "NOT EVERYWHERE", "accent": "cyan", "variant": "photo", "image": "thumbs/064-window-fan-alone-0.jpg", "align": "left", "pos": "center", "focus": "50% 45%", "punch": 1.0, "wordmark": false, "face": "persona/walt-combs-cutout.png", "faceAt": [82.0, 100.0], "faceCutout": true};

export default function CRNAThumbA(): React.ReactElement {
  return <Thumbnail {...props} />;
}
