// extract-frames.mjs — simplified, skip probe
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ffmpegPath = (await import('ffmpeg-static')).default;

const INPUT  = resolve(__dirname, '../public/hero.mp4');
const OUTPUT = resolve(__dirname, '../public/frames');

if (!existsSync(OUTPUT)) mkdirSync(OUTPUT, { recursive: true });

console.log('🖼  Extracting frames as WebP (quality 82)...');
console.log('   Input :', INPUT);
console.log('   Output:', OUTPUT);

// Extract all frames — let ffmpeg decide fps automatically
execFileSync(ffmpegPath, [
  '-i', INPUT,
  '-vf', 'fps=source_fps',   // keep original fps
  '-vcodec', 'webp',
  '-quality', '82',          // webp quality 0-100
  '-f', 'image2',
  `${OUTPUT}/frame_%04d.webp`,
], { stdio: 'inherit' });

const frames = readdirSync(OUTPUT).filter(f => f.endsWith('.webp'));
console.log(`\n✅ Extracted ${frames.length} frames → public/frames/`);
console.log(`\n👉 Now set TOTAL_FRAMES = ${frames.length} in HeroSection.tsx`);
