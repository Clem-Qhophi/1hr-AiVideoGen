// THE DATA LEAGUE 3-font system, loaded from Google Fonts (bundled by Remotion at render time).
// Display: Anton (condensed broadcast caps). Body: Archivo. Numbers: JetBrains Mono.
import { loadFont as loadDisplay } from '@remotion/google-fonts/Anton';
import { loadFont as loadBody } from '@remotion/google-fonts/Archivo';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as loadSerif } from '@remotion/google-fonts/Spectral';

export const FONT_DISPLAY = loadDisplay('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily;
export const FONT_BODY = loadBody('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] }).fontFamily;
export const FONT_MONO = loadMono('normal', { weights: ['400', '500', '700'], subsets: ['latin'] }).fontFamily;
// serif for UI wordmark clones — not a brand font
export const FONT_SERIF = loadSerif('normal', { weights: ['500', '600'], subsets: ['latin'] }).fontFamily;