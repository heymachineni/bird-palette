/**
 * Synthesizes the film's audio as WAV files (no external deps / codecs needed):
 *   - atmosphere-pad.wav : calm, warm minimal chord pad (background music)
 *   - type-click.wav     : soft mechanical typewriter tick
 *
 * Run:  node scripts/make-audio.mjs
 */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "..", "public/audio");
mkdirSync(outDir, { recursive: true });

const SR = 44100;

function normalize(buf, peak) {
  let max = 0;
  for (let i = 0; i < buf.length; i++) max = Math.max(max, Math.abs(buf[i]));
  if (max === 0) return;
  const g = peak / max;
  for (let i = 0; i < buf.length; i++) buf[i] *= g;
}

function applyFade(buf, inSec, outSec) {
  const inN = Math.floor(inSec * SR);
  const outN = Math.floor(outSec * SR);
  for (let i = 0; i < inN; i++) buf[i] *= i / inN;
  for (let i = 0; i < outN; i++) {
    buf[buf.length - 1 - i] *= i / outN;
  }
}

function genPad(dur = 45) {
  const N = SR * dur;
  const buf = new Float32Array(N);
  // C major add9 (C3 E3 G3 C4 D4) - consonant, warm.
  const chord = [130.81, 164.81, 196.0, 261.63, 293.66];
  const gains = [0.5, 0.34, 0.32, 0.26, 0.2];
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const lfo = 1 + 0.12 * Math.sin(2 * Math.PI * 0.08 * t); // slow swell
    let s = 0;
    for (let v = 0; v < chord.length; v++) {
      const f = chord[v];
      // gentle chorus via a slightly detuned partner
      s += gains[v] * (Math.sin(2 * Math.PI * f * t) + 0.7 * Math.sin(2 * Math.PI * (f + 0.3) * t));
    }
    buf[i] = s * lfo;
  }
  // one-pole low-pass for warmth
  let y = 0;
  const a = 0.16;
  for (let i = 0; i < N; i++) {
    y = y + a * (buf[i] - y);
    buf[i] = y;
  }
  applyFade(buf, 3.5, 4);
  normalize(buf, 0.5);
  return buf;
}

function genClick(dur = 0.07) {
  const N = Math.floor(SR * dur);
  const buf = new Float32Array(N);
  let prev = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const env = Math.exp(-t / 0.012);
    const n = Math.random() * 2 - 1;
    const hp = n - prev; // crude high-pass for a crisp tick
    prev = n;
    buf[i] = (0.6 * hp + 0.4 * Math.sin(2 * Math.PI * 2200 * t)) * env;
  }
  normalize(buf, 0.5);
  return buf;
}

/** Write a stereo 16-bit PCM WAV (mono source duplicated to L/R). */
function writeWav(file, mono) {
  const channels = 2;
  const bytesPerSample = 2;
  const frames = mono.length;
  const dataLen = frames * channels * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataLen);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLen, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(SR, 24);
  buffer.writeUInt32LE(SR * channels * bytesPerSample, 28);
  buffer.writeUInt16LE(channels * bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLen, 40);
  let off = 44;
  for (let i = 0; i < frames; i++) {
    let s = Math.max(-1, Math.min(1, mono[i]));
    const v = (s * 32767) | 0;
    buffer.writeInt16LE(v, off);
    buffer.writeInt16LE(v, off + 2);
    off += 4;
  }
  writeFileSync(file, buffer);
  return buffer.length;
}

const pad = genPad(45);
const padBytes = writeWav(resolve(outDir, "atmosphere-pad.wav"), pad);
console.log(`atmosphere-pad.wav ${(padBytes / 1048576).toFixed(1)}MB`);

const click = genClick(0.07);
const clickBytes = writeWav(resolve(outDir, "type-click.wav"), click);
console.log(`type-click.wav ${clickBytes} bytes`);
