export type QuestionType = 'simple' | 'four-options' | 'image-question' | 'video-question' | 'audio-question' | 'open' | 'image-open';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  questionNumber: number;
  totalQuestions: number;
  timeLimit: number;
  correctAnswer: string;
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

export type QuizQuestion = SimpleQuestion | FourOptionsQuestion | ImageQuestion | VideoQuestion | AudioQuestion | OpenQuestion | ImageOpenQuestion;

export interface QuizVideoData {
  title: string;
  questions: QuizQuestion[];
}
