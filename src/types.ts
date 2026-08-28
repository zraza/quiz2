export type QuestionType = 'simple' | 'four-options' | 'image-question' | 'video-question' | 'audio-question' | 'open' | 'image-open' | 'audio' | 'image-options' | 'this-or-that' | 'order' | 'match' | 'zoom-in' | 'blur-reveal' | 'true-or-false' | 'odd-one-out' | 'finish-the-lyric' | 'connection';

/**
 * Speed controls how fast animations play.
 * - 'slow': relaxed pace, good for older audience, complex questions
 * - 'normal': standard quiz pace
 * - 'fast': rapid fire, short answers, keeps energy high
 */
export type Speed = 'slow' | 'normal' | 'fast';

/** Default speeds per question type */
export const DEFAULT_SPEEDS: Record<QuestionType, Speed> = {
  'simple': 'normal',
  'four-options': 'normal',
  'image-question': 'normal',
  'video-question': 'slow',      // needs time to absorb visual
  'audio-question': 'slow',      // needs time to listen
  'open': 'slow',                // thinking time, no options to guide
  'image-open': 'slow',          // absorb image + think
  'audio': 'slow',               // listen carefully
  'image-options': 'normal',     // visual comparison is quick
  'this-or-that': 'fast',        // binary choice, snappy
  'order': 'normal',             // need time to think about sequence
  'match': 'normal',             // need time to match pairs
  'zoom-in': 'slow',            // image reveals slowly, need time to guess
  'blur-reveal': 'slow',        // same — gradual reveal
  'true-or-false': 'fast',      // binary, snappy
  'odd-one-out': 'normal',      // need to compare 4 items
  'finish-the-lyric': 'slow',   // listen + remember
  'connection': 'slow',         // requires lateral thinking
};

/** Speed multipliers for animation timings */
export const SPEED_CONFIG = {
  slow: { entryDelay: 5, entryGap: 3, revealFrames: 18, springDamping: 12, springStiffness: 160, mass: 0.9 },
  normal: { entryDelay: 3, entryGap: 2, revealFrames: 12, springDamping: 14, springStiffness: 220, mass: 0.7 },
  fast: { entryDelay: 1, entryGap: 1, revealFrames: 8, springDamping: 16, springStiffness: 300, mass: 0.5 },
} as const;

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  questionNumber: number;
  totalQuestions: number;
  timeLimit: number;
  correctAnswer: string;
  /** Override the default speed for this question type */
  speed?: Speed;
  /** Voiceover audio URL — plays at start of question */
  voUrl?: string;
  /** Voiceover for the answer reveal */
  voRevealUrl?: string;
  /** Duration of the question VO in seconds (timer starts after this) */
  voDuration?: number;
  /** URL to video/audio to play before timer starts (mp4, mp3, etc.) */
  mediaUrl?: string;
  /** How long to play the media in seconds (max 20). Only used when mediaRole='clue'. */
  mediaDuration?: number;
  /** 'cover' = fill parent, crop edges. 'contain' = show whole video, letterbox. Default: 'cover' */
  mediaFit?: 'cover' | 'contain';
  /** 'clue' = media plays first, options appear after, timer starts after. 
   *  'ambient' = media plays alongside options, just visual enhancement, timer starts immediately.
   *  Default: 'clue' */
  mediaRole?: 'clue' | 'ambient';
}

export interface SimpleQuestion extends BaseQuestion {
  type: 'simple';
  options: string[];
}

export interface FourOptionsQuestion extends BaseQuestion {
  type: 'four-options';
  options: string[];
}

export interface ImageQuestion extends BaseQuestion {
  type: 'image-question';
  imageUrl: string;
  options: string[];
}

export interface VideoQuestion extends BaseQuestion {
  type: 'video-question';
  videoTitle: string;
  options: string[];
}

export interface AudioQuestion extends BaseQuestion {
  type: 'audio-question';
  audioTitle: string;
  options: string[];
}

/** Open question: just text, no options. Viewer thinks, then answer reveals. */
export interface OpenQuestion extends BaseQuestion {
  type: 'open';
}

/** Image-open: shows an image as the question, no options. Answer reveals as text (or image). */
export interface ImageOpenQuestion extends BaseQuestion {
  type: 'image-open';
  imageUrl: string;
  answerImageUrl?: string;
}

/** Audio question: waveform visual + text options (like "name this song") */
export interface AudioQ extends BaseQuestion {
  type: 'audio';
  audioTitle: string;
  options: string[];
}

/** Image-options: 3 images as the answer choices (like "which painting is by Van Gogh?") */
export interface ImageOptionsQ extends BaseQuestion {
  type: 'image-options';
  options: string[];
  optionImages: string[]; // URLs for each option image
  correctIndex: number;
}

/** This-or-that: two choices side by side with images. Binary pick. */
export interface ThisOrThatQ extends BaseQuestion {
  type: 'this-or-that';
  optionA: string;
  optionB: string;
  imageA: string;
  imageB: string;
  correctSide: 'A' | 'B';
}

/** Order: 4 items shown in shuffled order, slide into correct order on reveal. */
export interface OrderQ extends BaseQuestion {
  type: 'order';
  /** Items in CORRECT order (index 0 = first/smallest/oldest) */
  items: { label: string; image?: string }[];
  /** The shuffled display order (indices into items array). e.g. [2,0,3,1] */
  displayOrder: number[];
}

/** Match: 3 items on left, 3 on right. Right slides to correct position on reveal. */
export interface MatchQ extends BaseQuestion {
  type: 'match';
  /** Left column items (fixed position) */
  left: { label: string; image?: string }[];
  /** Right column items — displayed in this order, which is WRONG */
  right: { label: string; image?: string }[];
  /** Correct mapping: correctOrder[i] = index in right[] that matches left[i] */
  correctOrder: number[];
}

export type QuizQuestion = SimpleQuestion | FourOptionsQuestion | ImageQuestion | VideoQuestion | AudioQuestion | OpenQuestion | ImageOpenQuestion | AudioQ | ImageOptionsQ | ThisOrThatQ | OrderQ | MatchQ | ZoomInQ | BlurRevealQ | TrueOrFalseQ | OddOneOutQ | FinishTheLyricQ | ConnectionQ;

/** Zoom-in: image starts super zoomed, slowly pulls out. Guess what it is. */
export interface ZoomInQ extends BaseQuestion {
  type: 'zoom-in';
  imageUrl: string;
  options: string[];
}

/** Blur-reveal: image starts blurry, gradually sharpens. */
export interface BlurRevealQ extends BaseQuestion {
  type: 'blur-reveal';
  imageUrl: string;
  options: string[];
}

/** True-or-false: statement shown, pick TRUE or FALSE. */
export interface TrueOrFalseQ extends BaseQuestion {
  type: 'true-or-false';
  statement: string;
  /** 'true' or 'false' */
  correctAnswer: 'true' | 'false';
}

/** Odd-one-out: 4 items, one doesn't belong. */
export interface OddOneOutQ extends BaseQuestion {
  type: 'odd-one-out';
  items: { label: string; image?: string }[];
  /** Index of the odd one (0-3) */
  oddIndex: number;
  /** Why it's the odd one out */
  explanation: string;
}

/** Finish-the-lyric: lyrics shown with a blank, audio plays then stops. */
export interface FinishTheLyricQ extends BaseQuestion {
  type: 'finish-the-lyric';
  /** The lyrics with "___" where the blank is */
  lyrics: string;
  /** The missing word(s) */
  missingWords: string;
  /** Song title for reveal */
  songTitle: string;
  artist: string;
  options: string[];
}

/** Connection: 4 items shown, guess what connects them. */
export interface ConnectionQ extends BaseQuestion {
  type: 'connection';
  items: string[];
  /** The connection/answer */
  connection: string;
  options: string[];
}

/** Get the speed config for a question (per-question override > type default) */
export function getSpeedConfig(question: QuizQuestion) {
  const speed = question.speed || DEFAULT_SPEEDS[question.type];
  return SPEED_CONFIG[speed];
}

export interface QuizVideoData {
  title: string;
  questions: QuizQuestion[];
}
