import React from 'react';
import { AbsoluteFill, Sequence, Audio } from 'remotion';
import type { QuizVideoData, QuizQuestion } from '../types';
import { voPath } from '../vo';
import { FPS, INTRO_FRAMES, GETREADY_FRAMES, TRANSITION_FRAMES, HALFWAY_FRAMES, OUTRO_FRAMES, REVEAL_SECONDS, MAX_MEDIA_SECONDS, BG_COLORS } from '../config';
import { Background } from '../components/Background';
import { IntroScreen } from './IntroScreen';
import { GetReady } from './GetReady';
import { QuestionTransition } from './QuestionTransition';
import { QuestionPlay } from './QuestionPlay';
import { QuestionOpen } from './QuestionOpen';
import { QuestionImage } from './QuestionImage';
import { QuestionAudio } from './QuestionAudio';
import { QuestionImageOptions } from './QuestionImageOptions';
import { QuestionThisOrThat } from './QuestionThisOrThat';
import { QuestionOrder } from './QuestionOrder';
import { QuestionMatch } from './QuestionMatch';
import { HalfwayScreen } from './HalfwayScreen';
import { OutroScreen } from './OutroScreen';

function getQuestionDuration(q: QuizQuestion): number {
  const role = q.mediaRole || 'clue';
  const media = role === 'clue' ? Math.min(q.mediaDuration || 0, MAX_MEDIA_SECONDS) : 0;
  const vo = q.voDuration || 0;
  return (vo + media + q.timeLimit + REVEAL_SECONDS) * FPS;
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
          voDuration={question.voDuration}
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
          voDuration={question.voDuration}
        />
      );
    case 'audio':
      return <QuestionAudio question={question} />;
    case 'image-options':
      return <QuestionImageOptions question={question} />;
    case 'this-or-that':
      return <QuestionThisOrThat question={question} />;
    case 'order':
      return <QuestionOrder question={question} />;
    case 'match':
      return <QuestionMatch question={question} />;
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
    <Sequence key="intro" from={currentFrame} durationInFrames={INTRO_FRAMES}>
      <AbsoluteFill>
        <Background color="#5BC0BE" />
        <IntroScreen title={data.title} questionCount={questions.length} />
      </AbsoluteFill>
      <Audio src={voPath('Welcome to the quiz! Can you score ten out of ten? Lets find out.')} />
    </Sequence>
  );
  currentFrame += INTRO_FRAMES;

  // GET READY
  sequences.push(
    <Sequence key="getready" from={currentFrame} durationInFrames={GETREADY_FRAMES}>
      <AbsoluteFill>
        <Background color="#6B4CE6" />
        <GetReady />
      </AbsoluteFill>
    </Sequence>
  );
  currentFrame += GETREADY_FRAMES;

  // QUESTIONS (with transitions before each, and halfway screen)
  questions.forEach((question, idx) => {
    // Halfway screen
    if (idx === halfwayIndex) {
      sequences.push(
        <Sequence key="halfway" from={currentFrame} durationInFrames={HALFWAY_FRAMES}>
          <AbsoluteFill>
            <Background color="#E85D75" />
            <HalfwayScreen />
          </AbsoluteFill>
          <Audio src={voPath('Halfway there! How are you doing? Drop your score in the comments!')} />
        </Sequence>
      );
      currentFrame += HALFWAY_FRAMES;
    }

    const bgColor = BG_COLORS[idx % BG_COLORS.length];

    // TRANSITION — "Question X"
    const transText = `Question ${['one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'][question.questionNumber - 1] || question.questionNumber}.`;
    sequences.push(
      <Sequence key={`trans-${question.id}`} from={currentFrame} durationInFrames={TRANSITION_FRAMES}>
        <AbsoluteFill>
          <Background color={bgColor} />
          <QuestionTransition questionNumber={question.questionNumber} totalQuestions={question.totalQuestions} />
        </AbsoluteFill>
        <Audio src={voPath(transText)} volume={1} />
      </Sequence>
    );
    currentFrame += TRANSITION_FRAMES;

    // QUESTION
    const duration = getQuestionDuration(question);
    const voDelay = Math.ceil((question.voDuration || 0) * FPS);
    const mediaDelay = (question.mediaRole || 'clue') === 'clue' ? Math.min(question.mediaDuration || 0, MAX_MEDIA_SECONDS) * FPS : 0;
    const revealStartFrame = voDelay + mediaDelay + question.timeLimit * FPS;

    sequences.push(
      <Sequence key={question.id} from={currentFrame} durationInFrames={duration}>
        <AbsoluteFill>
          <Background color={bgColor} />
          {renderQuestion(question)}
        </AbsoluteFill>
        {/* Question VO — plays at start */}
        {question.voUrl && <Audio src={question.voUrl} volume={1} />}
        {/* Reveal VO — plays when timer runs out */}
        {question.voRevealUrl && (
          <Sequence from={revealStartFrame}>
            <Audio src={question.voRevealUrl} volume={1} />
          </Sequence>
        )}
      </Sequence>
    );
    currentFrame += duration;
  });

  // OUTRO
  sequences.push(
    <Sequence key="outro" from={currentFrame} durationInFrames={OUTRO_FRAMES}>
      <AbsoluteFill>
        <Background color="#4CAF50" />
        <OutroScreen totalQuestions={questions.length} />
      </AbsoluteFill>
      <Audio src={voPath('Quiz complete! How did you do? Subscribe for more quizzes every week!')} />
    </Sequence>
  );

  return <AbsoluteFill>{sequences}</AbsoluteFill>;
};

export function calculateTotalDuration(data: QuizVideoData): number {
  const questions = data.questions;

  let total = INTRO_FRAMES + GETREADY_FRAMES + OUTRO_FRAMES + HALFWAY_FRAMES;
  questions.forEach((q) => {
    total += TRANSITION_FRAMES + getQuestionDuration(q);
  });
  return total;
}
