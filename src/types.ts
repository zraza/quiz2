export type QuestionType = 'simple' | 'four-options' | 'image-question' | 'video-question' | 'audio-question' | 'open' | 'image-open' | 'audio' | 'image-options';

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

export type QuizQuestion = SimpleQuestion | FourOptionsQuestion | ImageQuestion | VideoQuestion | AudioQuestion | OpenQuestion | ImageOpenQuestion | AudioQ | ImageOptionsQ;

/** Get the speed config for a question (per-question override > type default) */
export function getSpeedConfig(question: QuizQuestion) {
  const speed = question.speed || DEFAULT_SPEEDS[question.type];
  return SPEED_CONFIG[speed];
}

export interface QuizVideoData {
  title: string;
  questions: QuizQuestion[];
}
