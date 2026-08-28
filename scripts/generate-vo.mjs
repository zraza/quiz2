#!/usr/bin/env node
/**
 * Generate voiceover audio files using macOS `say` command.
 * Run: node scripts/generate-vo.mjs
 * 
 * File naming: hash of the text content (so same text = same file, change text = new file)
 * Output: public/vo/<hash>.m4a + manifest.json mapping text→file
 * 
 * Later: swap `say` for ElevenLabs API call.
 */

import { execSync } from 'child_process';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'fs';
import path from 'path';

// ============ CONFIGURATION ============
const VOICE = 'Daniel';  // British English
const RATE = 155;        // Words per minute
const OUT_DIR = path.resolve('public/vo');
const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json');

// ============ HASHING ============
/** Simple string hash — MUST match src/vo.ts exactly */
function simpleHash(str) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const combined = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return combined.toString(16).padStart(12, '0').slice(0, 12);
}

/** Hash text to a short filename-safe string */
export function voHash(text) {
  return simpleHash(text.trim().toLowerCase());
}

/** Get the VO file path for a given text */
export function voPath(text) {
  return `/vo/${voHash(text)}.m4a`;
}

// ============ TTS FUNCTION (swap this for ElevenLabs later) ============
function generateAudio(text, outFile) {
  const escaped = text.replace(/"/g, '\\"').replace(/'/g, "'\\''");
  execSync(`say -v ${VOICE} -r ${RATE} --file-format=mp4f -o "${outFile}" "${escaped}"`);
}

// ============ ALL VO TEXTS ============
// Every single moment that needs voice
function getAllVoTexts() {
  return [
    // === FLOW SCREENS ===
    { key: 'intro', text: 'Welcome to the quiz! Can you score ten out of ten? Lets find out.' },
    { key: 'getready', text: 'Get ready!' },
    { key: 'halfway', text: 'Halfway there! How are you doing? Drop your score in the comments!' },
    { key: 'outro', text: 'Quiz complete! How did you do? Subscribe for more quizzes every week!' },

    // === TRANSITIONS ===
    { key: 'trans-1', text: 'Question one.' },
    { key: 'trans-2', text: 'Question two.' },
    { key: 'trans-3', text: 'Question three.' },
    { key: 'trans-4', text: 'Question four.' },
    { key: 'trans-5', text: 'Question five.' },
    { key: 'trans-6', text: 'Question six.' },
    { key: 'trans-7', text: 'Question seven.' },
    { key: 'trans-8', text: 'Question eight.' },
    { key: 'trans-9', text: 'Question nine.' },
    { key: 'trans-10', text: 'Question ten.' },
    { key: 'trans-11', text: 'Question eleven.' },
    { key: 'trans-12', text: 'Question twelve.' },
    { key: 'trans-13', text: 'Question thirteen.' },
    { key: 'trans-14', text: 'Question fourteen.' },
    { key: 'trans-15', text: 'Question fifteen.' },
    { key: 'trans-16', text: 'Question sixteen.' },
    { key: 'trans-17', text: 'Question seventeen.' },
    { key: 'trans-18', text: 'Question eighteen.' },
    { key: 'trans-19', text: 'Question nineteen.' },
    { key: 'trans-20', text: 'Question twenty.' },

    // === QUESTIONS (read the question text) ===
    { key: 'q1', text: 'What is the capital of Australia?' },
    { key: 'q2', text: 'Which country does this flag belong to?' },
    { key: 'q3', text: 'In which year did the Berlin Wall fall, reuniting East and West Germany?' },
    { key: 'q4', text: 'Which movie is this scene from?' },
    { key: 'q5', text: 'What is the longest river in the world?' },
    { key: 'q5b', text: 'In which year was John Travolta born?' },
    { key: 'q6', text: 'Name this famous landmark.' },
    { key: 'q7', text: 'Which English footballer scored a hat-trick in the 1966 World Cup Final against West Germany?' },
    { key: 'q8', text: 'When did the London Underground first open?' },
    { key: 'q9', text: 'Which animal is this?' },
    { key: 'q10', text: 'What was the name of the ship that Charles Darwin sailed on during his famous voyage to the Galapagos Islands?' },
    { key: 'q11', text: 'Name the artist who performed this famous song.' },
    { key: 'q12', text: 'Which painting is by Vincent van Gogh?' },
    { key: 'q13', text: 'Which country has a larger population?' },
    { key: 'q14', text: 'Which building is taller?' },
    { key: 'q15', text: 'Arrange these events from earliest to latest.' },
    { key: 'q16', text: 'Match the landmark to its country.' },

    // === REVEALS (announce the answer) ===
    { key: 'q1-reveal', text: 'The answer is Canberra.' },
    { key: 'q2-reveal', text: 'The answer is Brazil.' },
    { key: 'q3-reveal', text: 'The answer is 1989.' },
    { key: 'q4-reveal', text: 'The answer is The Godfather.' },
    { key: 'q5-reveal', text: 'The answer is The Nile.' },
    { key: 'q5b-reveal', text: 'The answer is 1954.' },
    { key: 'q6-reveal', text: 'The answer is Machu Picchu.' },
    { key: 'q7-reveal', text: 'The answer is Geoff Hurst.' },
    { key: 'q8-reveal', text: 'The answer is 1863.' },
    { key: 'q9-reveal', text: 'The answer is Pangolin.' },
    { key: 'q10-reveal', text: 'The answer is HMS Beagle.' },
    { key: 'q11-reveal', text: 'The answer is Queen.' },
    { key: 'q12-reveal', text: 'The answer is Starry Night.' },
    { key: 'q13-reveal', text: 'The answer is Turkey.' },
    { key: 'q14-reveal', text: 'The answer is the Eiffel Tower.' },
    { key: 'q15-reveal', text: 'The correct order is Moon Landing, Berlin Wall, World Wide Web.' },
    { key: 'q16-reveal', text: 'Eiffel Tower is France, Colosseum is Italy, Big Ben is United Kingdom.' },

    // === TIMER WARNINGS ===
    { key: 'times-up', text: "Time's up!" },
    { key: 'hurry', text: 'Hurry!' },
  ];
}

// ============ MAIN ============
mkdirSync(OUT_DIR, { recursive: true });

// Load existing manifest if any
let manifest = {};
if (existsSync(MANIFEST_PATH)) {
  manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
}

const allTexts = getAllVoTexts();
let generated = 0;
let skipped = 0;

console.log(`Generating VO with voice: ${VOICE}, rate: ${RATE}`);
console.log(`Output: ${OUT_DIR}\n`);

for (const { key, text } of allTexts) {
  const hash = voHash(text);
  const filename = `${hash}.m4a`;
  const outFile = path.join(OUT_DIR, filename);

  if (existsSync(outFile)) {
    skipped++;
    manifest[key] = { text, hash, file: filename, path: `/vo/${filename}` };
    continue;
  }

  try {
    generateAudio(text, outFile);
    // Get duration
    const info = execSync(`afinfo "${outFile}" 2>&1`).toString();
    const durationMatch = info.match(/estimated duration: ([\d.]+)/);
    const duration = durationMatch ? parseFloat(durationMatch[1]).toFixed(2) : '?';
    
    manifest[key] = { text, hash, file: filename, path: `/vo/${filename}`, duration: parseFloat(duration) };
    console.log(`  ✓ ${key} → ${filename} (${duration}s)`);
    generated++;
  } catch (e) {
    console.error(`  ✗ ${key} FAILED:`, e.message);
  }
}

// Write manifest
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

console.log(`\n✅ Done! Generated: ${generated}, Skipped: ${skipped}, Total: ${allTexts.length}`);
console.log(`Manifest: ${MANIFEST_PATH}`);
