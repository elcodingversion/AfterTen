import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  CurvyHeartDivider,
  PixelStarButton,
  TopHandsCodeArt,
  WalkingLearnersArt,
} from '../components/HandDrawnArt.tsx';
import { type PageId } from '../types.ts';

interface WelcomePageProps {
  onNavigate: (page: PageId) => void;
  onTriggerJoke: () => void;
  quizCompleted: boolean;
}

const WELCOME_STEPS = [
  { key: 'title', text: "WELL, LOOK\nWHO'S HERE." },
  { key: 'tag', text: 'A tiny archive of our ten days together' },
  { key: 'greeting', text: 'HALO TEMEN-TEMEN!' },
  {
    key: 'body',
    text: 'Sepuluh hari yang penuh hal baru, error Laravel yang bikin melongo, dan kenangan kecil yang sayang banget kalau lewat gitu aja—yuk flashback sebentar bareng-bareng sebelum nutup halaman ini.',
  },
] as const;

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onNavigate,
  onTriggerJoke,
  quizCompleted,
}) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [typingDone, setTypingDone] = useState(false);

  // Sequential typewriter animation across the welcome sheet
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setStepIdx(WELCOME_STEPS.length);
      setTypingDone(true);
      return;
    }
    if (typingDone) return;

    const current = WELCOME_STEPS[stepIdx];
    if (!current) {
      setTypingDone(true);
      return;
    }

    if (charIdx < current.text.length) {
      const ch = current.text[charIdx];
      const delay = ch === '.' || ch === '!' || ch === '—' ? 70 : current.key === 'body' ? 18 : 30;
      const timer = window.setTimeout(() => {
        setCharIdx((c) => c + 1);
      }, delay);
      return () => window.clearTimeout(timer);
    }

    const pauseTimer = window.setTimeout(() => {
      if (stepIdx + 1 >= WELCOME_STEPS.length) {
        setTypingDone(true);
      } else {
        setStepIdx((s) => s + 1);
        setCharIdx(0);
      }
    }, 220);

    return () => window.clearTimeout(pauseTimer);
  }, [stepIdx, charIdx, typingDone]);

  const getTyped = (targetIdx: number) => {
    if (typingDone || stepIdx > targetIdx) return WELCOME_STEPS[targetIdx].text;
    if (stepIdx < targetIdx) return '';
    return WELCOME_STEPS[targetIdx].text.slice(0, charIdx);
  };

  const isActiveStep = (targetIdx: number) => !typingDone && stepIdx === targetIdx;

  return (
    <section className="max-w-xl mx-auto px-4 sm:px-6 pt-4 pb-16">
      <div className="zine-sheet rounded-[28px] px-5 sm:px-10 pt-4 pb-10 text-center space-y-6 relative">
        {/* Tiny corner joke star */}
        <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4">
          <PixelStarButton onClick={onTriggerJoke} label="Klik buat recehan Laravel" />
        </div>

        {/* Top hand-drawn illustration */}
        <div>
          <TopHandsCodeArt />
        </div>

        {/* Hand-lettered main title with typewriter */}
        <div className="space-y-2 pt-1 min-h-[104px] sm:min-h-[126px]">
          <h1 className="font-hand text-[2.05rem] sm:text-5xl text-[#353630] leading-[1.12] tracking-wide whitespace-pre-line">
            {getTyped(0)}
            {isActiveStep(0) && (
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-[0.9em] bg-[#353630] ml-1 align-middle animate-pulse"
              />
            )}
          </h1>
          <p className="text-sm text-[#5C5E54] pt-1 min-h-[24px]">
            {getTyped(1)}
            {isActiveStep(1) && (
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-[1em] bg-[#353630] ml-0.5 align-middle animate-pulse"
              />
            )}
          </p>
        </div>

        <CurvyHeartDivider />

        {/* Single unified personal note block with typewriter */}
        <div className="space-y-3 max-w-md mx-auto min-h-[124px]">
          <h2 className="font-hand text-2xl sm:text-3xl text-[#353630] min-h-[36px]">
            {getTyped(2)}
            {isActiveStep(2) && (
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-[0.9em] bg-[#353630] ml-1 align-middle animate-pulse"
              />
            )}
          </h2>

          <p className="text-sm sm:text-[15px] text-[#353630]/90 leading-relaxed">
            {getTyped(3)}
            {isActiveStep(3) && (
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-[1em] bg-[#353630] ml-0.5 align-middle animate-pulse"
              />
            )}
          </p>
        </div>

        {/* Bottom hand-drawn illustration */}
        <div className="pt-1">
          <WalkingLearnersArt />
        </div>

        <CurvyHeartDivider />

        {/* CTA (always clickable, gently highlights as typing finishes) */}
        <div className="pt-1 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('checkin')}
            className="btn-sky group inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-sm font-semibold cursor-pointer min-h-[46px]"
          >
            <span>Masuk ke archive</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          {quizCompleted && (
            <button
              type="button"
              onClick={() => onNavigate('archive')}
              className="text-xs text-[#5C5E54] hover:text-[#353630] underline underline-offset-4 cursor-pointer"
            >
              Langsung ke Scrapbook
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
