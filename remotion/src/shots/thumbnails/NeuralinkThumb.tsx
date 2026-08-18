// AUTO-GENERATED thumbnail shot (tools/gen_thumbnail_tsx.py). Safe to re-generate.
import React from 'react';
import { Thumbnail, type ThumbnailProps } from '../../lib/thumbnail';

export const compositionConfig = {
  id: 'NeuralinkThumb',
  durationInSeconds: 1,
  fps: 30,
  width: 1280,
  height: 720,
};

const props: ThumbnailProps = {"headline": "The End of Smart Home Hubs?", "emphasis": "50ms", "sub": "Neuralink N3 · 2026", "badge": "BRAIN AI", "accent": "#00FF88", "variant": "photo", "image": "thumbs/000-brain-chip-neural-interface-futuristic-0.jpg", "align": "left", "pos": "center", "focus": "50% 50%", "punch": 1.0, "wordmark": false, "faceCutout": false};

export default function NeuralinkThumb(): React.ReactElement {
  return <Thumbnail {...props} />;
}
