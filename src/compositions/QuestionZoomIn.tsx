import React from 'react';
import { AbsoluteFill, Img, spring, interpolate, useCurrentFrame } from 'remotion';
import { AutoText } from '../components/AutoText';
import type { ZoomInQ } from '../types';
import { useQuizTiming } from '../hooks/useQuizTiming';
import { CLAMP } from '../config';

/**
 * QuestionZoomIn — BONUS variant (cinematic dark theme).
 *
 * Dark navy/black gradient background with subtle star shimmer.
 * Image zooms from scale(4.5) → scale(1.0) with vignette overlay.
 * Custom thick points bar replaces TimerBar — points integrated inside.
 * Premium "entering a different world" feel.
 */
export const QuestionZoomIn: React.FC<{ question: ZoomInQ }> = ({ question }) => {
  const { frame, fps, voFrames, quizFrame, countdownFrames, isRevealing, revealProgress } = useQuizTiming(question);

  // --- Points logic ---
  const elapsed = countdownFrames > 0 ? quizFrame / countdownFrames : 0;
  const points = elapsed < 0.25 ? 150 : elapsed < 0.5 ? 100 : elapsed < 0.75 ? 50 : 5;
  const pointsColor = points === 150 ? '#4CAF50' : points === 100 ? '#FFEB3B' : points === 50 ? '#FF9800' : '#F44336';

  // Detect point-drop frames for flash/shake
  const dropFrames = [
    Math.floor(countdownFrames * 0.25),
    Math.floor(countdownFrames * 0.5),
    Math.floor(countdownFrames * 0.75),
  ];
  let barFlash = 0;
  let pointsShakeX = 0;
  for (const df of dropFrames) {
    const since = quizFrame - df;
    if (since >= 0 && since < 12) {
      barFlash = interpolate(since, [0, 3, 12], [1, 0.5, 0], CLAMP);
      pointsShakeX = Math.sin(since * 2.5) * interpolate(since, [0, 12], [8, 0], CLAMP);
      break;
    }
  }

  // --- Zoom ---
  const zoomProgress = isRevealing
    ? 1
    : interpolate(quizFrame, [0, countdownFrames], [0, 1], CLAMP);
  const scale = interpolate(zoomProgress, [0, 1], [4.5, 1]);

  // Timer bar width (time remaining)
  const timerWidth = isRevealing ? 0 : interpolate(quizFrame, [0, countdownFrames], [100, 0], CLAMP);

  // Image entry
  const imgEntry = spring({ frame: Math.max(0, frame - 3), fps, config: { damping: 14, stiffness: 200, mass: 0.8 } });
  const imgOpacity = interpolate(imgEntry, [0, 1], [0, 1]);

  // Answer reveal spring
  const answerSpring = spring({ frame: Math.max(0, quizFrame - countdownFrames), fps, config: { damping: 12, stiffness: 180, mass: 0.8 } });
  const answerScale = interpolate(answerSpring, [0, 1], [0.4, 1]);
  const answerOpacity = interpolate(answerSpring, [0, 1], [0, 1]);

  // Glowing border breathe
  const breathe = Math.sin(frame * 0.06) * 0.3 + 0.7;

  // Shimmer particles
  const particles = Array.from({ length: 20 }, (_, i) => {
    const x = ((i * 137.5) % 1920);
    const baseY = ((i * 97.3) % 1080);
    const y = baseY + Math.sin(frame * 0.03 + i * 1.7) * 15;
    const opacity = (Math.sin(frame * 0.05 + i * 2.1) + 1) * 0.15;
    const size = 2 + (i % 3);
    return { x, y, opacity, size };
  });

  // Bonus label glow
  const labelGlow = Math.sin(frame * 0.08) * 0.3 + 0.7;

  return (
    <AbsoluteFill>
      {/* DARK BACKGROUND — covers parent sunburst */}
      <AbsoluteFill style={{
        background: 'linear-gradient(180deg, #0a0e1a 0%, #0d1525 40%, #111d33 70%, #0a0e1a 100%)',
      }} />

      {/* Subtle star shimmer particles */}
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: p.x,
          top: p.y,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: '#ffffff',
          opacity: p.opacity,
          boxShadow: `0 0 ${p.size * 2}px rgba(255,255,255,0.3)`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* BONUS ROUND label — glowing above question */}
      <div style={{
        position: 'absolute',
        top: 28,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: imgOpacity,
        zIndex: 10,
      }}>
        <div style={{
          padding: '8px 32px',
          borderRadius: 12,
          background: `rgba(255, 215, 0, ${0.1 + labelGlow * 0.1})`,
          border: '2px solid rgba(255, 215, 0, 0.5)',
          boxShadow: `0 0 ${20 + labelGlow * 15}px rgba(255, 215, 0, ${0.2 + labelGlow * 0.15})`,
        }}>
          <span style={{
            fontSize: 28,
            fontWeight: 900,
            color: '#FFD700',
            textShadow: `0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.4)`,
            letterSpacing: 3,
          }}>
            ⭐ BONUS ROUND
          </span>
        </div>
      </div>

      {/* QUESTION TEXT — white on dark semi-transparent card */}
      <div style={{
        position: 'absolute',
        top: 90,
        left: 80,
        right: 80,
        display: 'flex',
        justifyContent: 'center',
        opacity: isRevealing ? interpolate(revealProgress, [0, 0.3], [1, 0.3], CLAMP) : 1,
      }}>
        <div style={{
          background: 'rgba(10, 15, 30, 0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: 20,
          padding: '20px 48px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          maxWidth: 1600,
          textAlign: 'center',
        }}>
          <AutoText width={1500} maxSize={72} minSize={36} maxLines={2} color="#ffffff">
            {question.questionText}
          </AutoText>
        </div>
      </div>

      {/* ZOOMED IMAGE — 70% screen height, centered */}
      <div style={{
        position: 'absolute',
        top: 190,
        left: 80,
        right: 80,
        bottom: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          maxHeight: '70vh',
          borderRadius: 24,
          overflow: 'hidden',
          position: 'relative',
          border: `3px solid rgba(100, 180, 255, ${0.3 + breathe * 0.4})`,
          boxShadow: `0 0 ${30 + breathe * 20}px rgba(100, 180, 255, ${0.15 + breathe * 0.15}), 0 20px 60px rgba(0,0,0,0.6)`,
          opacity: imgOpacity,
        }}>
          <Img
            src={question.imageUrl}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
          />

          {/* Vignette overlay — dark edges to frame zoomed image */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${0.6 - zoomProgress * 0.4}) 100%)`,
            pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* CUSTOM POINTS TIMER BAR */}
      {!isRevealing && quizFrame > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: 80,
          right: 80,
          height: 56,
          borderRadius: 28,
          background: 'rgba(0, 0, 0, 0.7)',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          overflow: 'hidden',
          boxShadow: `0 0 20px rgba(0,0,0,0.5)${barFlash > 0 ? `, 0 0 30px rgba(255,255,255,${barFlash * 0.5})` : ''}`,
        }}>
          {/* Colored fill bar */}
          <div style={{
            position: 'absolute',
            top: 3,
            left: 3,
            bottom: 3,
            width: `${timerWidth}%`,
            borderRadius: 26,
            background: pointsColor,
            transition: 'background 0.3s',
            boxShadow: `0 0 15px ${pointsColor}60`,
          }} />

          {/* Flash overlay on point drop */}
          {barFlash > 0 && (
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 28,
              background: `rgba(255, 255, 255, ${barFlash * 0.4})`,
              pointerEvents: 'none',
            }} />
          )}

          {/* Points text centered in bar */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `translateX(${pointsShakeX}px)`,
          }}>
            <span style={{
              fontSize: 28,
              fontWeight: 900,
              color: '#ffffff',
              textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)',
              letterSpacing: 3,
            }}>
              {points} POINTS
            </span>
          </div>
        </div>
      )}

      {/* ANSWER REVEAL */}
      {isRevealing && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
        }}>
          {/* Dark scrim behind answer */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `rgba(0, 0, 0, ${interpolate(revealProgress, [0, 0.5], [0, 0.5], CLAMP)})`,
            pointerEvents: 'none',
          }} />

          <div style={{
            transform: `scale(${answerScale})`,
            opacity: answerOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            zIndex: 21,
          }}>
            <div style={{
              background: 'rgba(10, 15, 30, 0.9)',
              borderRadius: 24,
              padding: '36px 72px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 60px rgba(0,0,0,0.8), 0 0 40px rgba(100, 180, 255, 0.2)',
            }}>
              <AutoText width={1400} maxSize={120} minSize={56} maxLines={2} color="#ffffff">
                {question.correctAnswer}
              </AutoText>
            </div>

            {/* Points earned */}
            <span style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: 2,
            }}>
              {points} POINTS EARNED
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
