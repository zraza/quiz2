#!/usr/bin/env node
/**
 * Generate voiceover audio files using macOS `say` command.
 * Run: node scripts/generate-vo.mjs
 * 
 * Output: public/vo/<questionId>.m4a + intro.m4a + outro.m4a + halfway.m4a
 * 
 * Later: swap `say` for ElevenLabs API call.
 */

import { execSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import path from 'path';

const VOICE = 'Daniel';  // British English, authoritative
const RATE = 155;        // Words per minute (slightly slower for clarity on TV)
const OUT_DIR = path.resolve('public/vo');

mkdirSync(OUT_DIR, { recursive: true });

// Import mock data — we read the compiled version
// For now, define the VO text inline based on the quiz flow
const voTexts = [
  // Intro
  { id: 'intro', text: 'Welcome to the quiz! Can you score ten out of ten? Lets find out.' },
  { id: 'getready', text: 'Get ready!' },
  
  // Questions — read from mock data structure
  { id: 'q1', text: 'Question one. Which country does this flag belong to?' },
  { id: 'q2', text: 'Question two. What is the capital city of Japan?' },
  { id: 'q3', text: 'Question three. In which year did the Berlin Wall fall, reuniting East and West Germany?' },
  { id: 'q4', text: 'Question four. Which movie is this scene from?' },
  { id: 'q5', text: 'Question five. What is the longest river in the world?' },
  { id: 'q5b', text: 'Question five. In which year was John Travolta born?' },
  { id: 'q6', text: 'Question six. Name this famous landmark.' },
  { id: 'q7', text: 'Question seven. Which English footballer scored a hat-trick in the 1966 World Cup Final against West Germany?' },
  { id: 'q8', text: 'Question eight. When did the London Underground first open?' },
  { id: 'q9', text: 'Question nine. Which animal is this?' },
  { id: 'q10', text: 'Question ten. What was the name of the ship that Charles Darwin sailed on during his famous voyage to the Galapagos Islands?' },
  { id: 'q11', text: 'Question eleven. Name the artist who performed this famous song.' },
  { id: 'q12', text: 'Question twelve. Which painting is by Vincent van Gogh?' },
  { id: 'q13', text: 'Question thirteen. Which country has a larger population?' },
  { id: 'q14', text: 'Question fourteen. Which building is taller?' },
  { id: 'q15', text: 'Question fifteen. Arrange these events from earliest to latest.' },
  { id: 'q16', text: 'Question sixteen. Match the landmark to its country.' },

  // Reveals — short answer announcements
  { id: 'q1-reveal', text: 'The answer is Brazil.' },
  { id: 'q2-reveal', text: 'The answer is Tokyo.' },
  { id: 'q3-reveal', text: 'The answer is 1989.' },
  { id: 'q4-reveal', text: 'The answer is The Godfather.' },
  { id: 'q5-reveal', text: 'The answer is The Nile.' },
  { id: 'q5b-reveal', text: 'The answer is 1954.' },
  { id: 'q6-reveal', text: 'The answer is Machu Picchu.' },
  { id: 'q7-reveal', text: 'The answer is Geoff Hurst.' },
  { id: 'q8-reveal', text: 'The answer is 1863.' },
  { id: 'q9-reveal', text: 'The answer is Pangolin.' },
  { id: 'q10-reveal', text: 'The answer is HMS Beagle.' },
  { id: 'q11-reveal', text: 'The answer is Queen.' },
  { id: 'q12-reveal', text: 'The answer is Starry Night.' },
  { id: 'q13-reveal', text: 'The answer is Turkey.' },
  { id: 'q14-reveal', text: 'The answer is the Eiffel Tower.' },
  { id: 'q15-reveal', text: 'The correct order is Moon Landing, Berlin Wall, World Wide Web.' },
  { id: 'q16-reveal', text: 'Eiffel Tower is France, Colosseum is Italy, Big Ben is United Kingdom.' },

  // Halfway + Outro
  { id: 'halfway', text: 'Halfway there! How are you doing? Drop your score in the comments!' },
  { id: 'outro', text: 'Quiz complete! How did you do? Subscribe for more quizzes every week!' },
];

console.log(`Generating ${voTexts.length} VO files with voice: ${VOICE}, rate: ${RATE}`);

for (const { id, text } of voTexts) {
  const outFile = path.join(OUT_DIR, `${id}.m4a`);
  
  if (existsSync(outFile)) {
    console.log(`  ✓ ${id}.m4a (exists, skipping)`);
    continue;
  }

  try {
    execSync(`say -v ${VOICE} -r ${RATE} --file-format=mp4f -o "${outFile}" "${text.replace(/"/g, '\\"')}"`);
    // Get duration
    const info = execSync(`afinfo "${outFile}" 2>&1`).toString();
    const durationMatch = info.match(/estimated duration: ([\d.]+)/);
    const duration = durationMatch ? parseFloat(durationMatch[1]).toFixed(2) : '?';
    console.log(`  ✓ ${id}.m4a (${duration}s)`);
  } catch (e) {
    console.error(`  ✗ ${id}.m4a FAILED:`, e.message);
  }
}

console.log('\nDone! Files in: public/vo/');
console.log('Next: wire into Remotion compositions using <Audio> component');
