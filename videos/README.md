# videos/

**This is where your generated videos live. It ships empty on purpose.**

One folder per video — `video-xxxxx/`. The app creates the structure automatically
when you generate a video. You don't need to make it by hand.

```
videos/video-xxxxx/
  recording.mp4               uploaded screen recording (if tutorial mode)
  work/
    script.md                  the AI-generated narration script
    script_spoken.txt          spoken text extracted from script
    keyterms.txt               brand/tech names for accuracy
    shot-plan.json             which visual templates go where
    edited-transcript.json     word-level timestamps (sync spine)
    timeline.json              which shot composites where
    video_analysis.json        screen recording analysis (if tutorial mode)
    keyframes/                 extracted key frame thumbnails (if tutorial mode)
    audio/voiceover.mp3        the TTS voiceover
  reference/master.mp4         the master video (branded bg + voiceover, or the recording)
  output/video-xxxxx-preview.mp4  the final baked video
```

**Nothing here is committed by default.** `.gitignore` keeps raw footage, master cuts,
and renders out of git. The repo carries the reproducible pipeline, not your video files.

## Preview the animation engine

The example shots in `remotion/src/shots/example/` render standalone, no footage required:

```bash
cd remotion && npm run studio
```

That opens Remotion Studio where you can preview all the shot templates.
