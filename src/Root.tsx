import React from 'react';
import { Composition } from 'remotion';
import { QuizVideo, calculateTotalDuration } from './compositions/QuizVideo';
import { mockQuizData } from './mock-data';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QuizVideo"
        component={QuizVideo}
        durationInFrames={calculateTotalDuration(mockQuizData)}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ data: mockQuizData }}
      />
    </>
  );
};
