// AUTO-GENERATED thumbnail shot (tools/gen_thumbnail_tsx.py). Safe to re-generate.
import React from 'react';
import { Thumbnail, type ThumbnailProps } from '../../lib/thumbnail';

export const compositionConfig = {
  id: 'KillSwitchThumb',
  durationInSeconds: 1,
  fps: 30,
  width: 1280,
  height: 720,
};

const props: ThumbnailProps = {"headline": "KILL SWITCH", "emphasis": "ACT", "badge": "CONGRESS", "accent": "hot", "variant": "photo", "image": "thumbs/001-emergency-shutdown-button-0.jpg", "align": "left", "pos": "center", "focus": "50% 50%", "punch": 1.0, "wordmark": false, "faceCutout": false};

export default function KillSwitchThumb(): React.ReactElement {
  return <Thumbnail {...props} />;
}
