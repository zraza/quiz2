import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import type { QuizVideoData, QuizQuestion } from '../types';
import { Background } from '../components/Background';
import { IntroScreen } from './IntroScreen';
import { GetReady } from './GetReady';
import { QuestionTransition } from './QuestionTransition';
import { QuestionPlay } from './QuestionPlay';
import { QuestionOpen } from './QuestionOpen';
import { QuestionImage } from './QuestionImage';
import { QuestionAudio } from './QuestionAudio';
import { QuestionImageOptions } from './QuestionImageOptions';
import { HalfwayScreen } from './HalfwayScreen';
import { OutroScreen } from './OutroScreen';

const FPS = 30;
const INTRO_DURATION = 5 * FPS;
const GETREADY_DURATION = 3 * FPS;
const TRANSITION_DURATION = Math.round(1.5 * FPS);  // 1.5 seconds between questions
const HALFWAY_DURATION = 3 * FPS;
const OUTRO_DURATION = 5 * FPS;
const REVEAL_SECONDS = 3;

const BG_COLORS = ['#5BC0BE', '#6B4CE6', '#E85D75', '#F4A942', '#5BC0BE', '#6B4CE6', '#E85D75', '#F4A942', '#5BC0BE', '#6B4CE6'];

function getQuestionDuration(q: QuizQuestion): number {
  const role = q.mediaRole || 'clue';
  const media = role === 'clue' ? Math.min(q.mediaDuration || 0, 20) : 0;
  return (media + q.timeLimit + REVEAL_SECONDS) * FPS;
}

function renderQuestion(question: QuizQuestion): React.ReactNode {
  switch (question.type) {
    case 'open':
      return (
        <QuestionOpen
          questionNumber={question.questionNumber}
          questionText={question.questionText}
          timeLimit={question.timeLimit}
          answer={question.correctAnswer}
        />
      );
    case 'image-open':
      return (
        <QuestionImage
          questionNumber={question.questionNumber}
          questionText={question.questionText}
          timeLimit={question.timeLimit}
          answer={question.correctAnswer}
          answerImageUrl={question.answerImageUrl}
        />
      );
    case 'audio':
      return <QuestionAudio question={question} />;
    case 'image-options':
      return <QuestionImageOptions question={question} />;
    case 'simple':
    case 'four-options':
    case 'image-question':
    case 'video-question':
    case 'audio-question':
      return <QuestionPlay question={question} />;
  }
}

export const QuizVideo: React.FC<{ data: QuizVideoData }> = ({ data }) => {
  const questions = data.questions;
  const halfwayIndex = Math.floor(questions.length / 2);

  let currentFrame = 0;
  const sequences: React.ReactNode[] = [];

  // INTRO
  sequences.push(
    <Sequence key="intro" from={currentFrame} durationInFrames={INTRO_DURATION}>
      <AbsoluteFill>
        <Background color="#5BC0BE" />
        <IntroScreen title={data.title} questionCount={questions.length} />
      </AbsoluteFill>
    </Sequence>
  );
  currentFrame += INTRO_DURATION;

  // GET READY
  sequences.push(
    <Sequence key="getready" from={currentFrame} durationInFrames={GETREADY_DURATION}>
      <AbsoluteFill>
        <Background color="#6B4CE6" />
        <GetReady />
      </AbsoluteFill>
    </Sequence>
  );
  currentFrame += GETREADY_DURATION;

  // QUESTIONS (with transitions before each, and halfway screen)
  questions.forEach((question, idx) => {
    // Halfway screen
    if (idx === halfwayIndex) {
      sequences.push(
        <Sequence key="halfway" from={currentFrame} durationInFrames={HALFWAY_DURATION}>
          <AbsoluteFill>
            <Background color="#E85D75" />
            <HalfwayScreen />
          </AbsoluteFill>
        </Sequence>
      );
      currentFrame += HALFWAY_DURATION;
    }

    const bgColor = BG_COLORS[idx % BG_COLORS.length];

    // TRANSITION — "Question X"
    sequences.push(
      <Sequence key={`trans-${question.id}`} from={currentFrame} durationInFrames={TRANSITION_DURATION}>
        <AbsoluteFill>
          <Background color={bgColor} />
          <QuestionTransition questionNumber={question.questionNumber} totalQuestions={question.totalQuestions} />
        </AbsoluteFill>
      </Sequence>
    );
    currentFrame += TRANSITION_DURATION;

    // QUESTION
    const duration = getQuestionDuration(question);
    sequences.push(
      <Sequence key={question.id} from={currentFrame} durationInFrames={duration}>
        <AbsoluteFill>
          <Background color={bgColor} />
          {renderQuestion(question)}
        </AbsoluteFill>
      </Sequence>
    );
    currentFrame += duration;
  });

  // OUTRO
  sequences.push(
    <Sequence key="outro" from={currentFrame} durationInFrames={OUTRO_DURATION}>
      <AbsoluteFill>
        <Background color="#4CAF50" />
        <OutroScreen totalQuestions={questions.length} />
      </AbsoluteFill>
    </Sequence>
  );

  return <AbsoluteFill>{sequences}</AbsoluteFill>;
};

export function calculateTotalDuration(data: QuizVideoData): number {
  const questions = data.questions;

  let total = INTRO_DURATION + GETREADY_DURATION + OUTRO_DURATION + HALFWAY_DURATION;
  questions.forEach((q) => {
    total += TRANSITION_DURATION + getQuestionDuration(q);
  });
  return total;
}
