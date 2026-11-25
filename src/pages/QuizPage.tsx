import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { CurvyHeartDivider } from '../components/HandDrawnArt.tsx';
import { QUIZ_PERSONAS, QUIZ_QUESTIONS } from '../data/quiz-questions.ts';
import { type PageId, type QuizSavedState } from '../types.ts';

interface QuizPageProps {
  savedState: QuizSavedState;
  onUpdateState: (next: QuizSavedState) => void;
  onNavigate: (page: PageId) => void;
}

function computeDominantTrait(
  answers: Record<number, string>
): 'artisan' | 'webphp' | 'blade' | 'survivor' {
  const counts: Record<'artisan' | 'webphp' | 'blade' | 'survivor', number> = {
    artisan: 0,
    webphp: 0,
    blade: 0,
    survivor: 0,
  };

  for (const q of QUIZ_QUESTIONS) {
    const chosenId = answers[q.id];
    const opt = q.options.find((o) => o.id === chosenId);
    if (opt) {
      counts[opt.trait] += 1;
    }
  }

  let bestTrait: 'artisan' | 'webphp' | 'blade' | 'survivor' = 'survivor';
  let bestScore = -1;
  (Object.keys(counts) as Array<keyof typeof counts>).forEach((trait) => {
    if (counts[trait] > bestScore) {
      bestScore = counts[trait];
      bestTrait = trait;
    }
  });

  return bestTrait;
}

const OPTION_HOVER_WASH = [
  'hover:bg-[#CFE0EE]/65',
  'hover:bg-[#DCE5D6]/70',
  'hover:bg-[#E8DFF2]/70',
  'hover:bg-[#F3DDA9]/65',
];

export const QuizPage: React.FC<QuizPageProps> = ({
  savedState,
  onUpdateState,
  onNavigate,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentQuestion = QUIZ_QUESTIONS[stepIndex];
  const selectedOptionId = savedState.answers[currentQuestion.id] ?? '';

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !cardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }, cardRef);

    return () => ctx.revert();
  }, [stepIndex, savedState.completed]);

  const handleSelectOption = (optionId: string) => {
    onUpdateState({
      ...savedState,
      answers: {
        ...savedState.answers,
        [currentQuestion.id]: optionId,
      },
    });
  };

  const handleNext = () => {
    if (stepIndex < totalQuestions - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      const trait = computeDominantTrait(savedState.answers);
      onUpdateState({
        ...savedState,
        completed: true,
        dominantTrait: trait,
      });
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  const handleRetake = () => {
    setStepIndex(0);
    onUpdateState({
      answers: {},
      completed: false,
      dominantTrait: null,
    });
  };

  const progressPercent = savedState.completed
    ? 100
    : ((stepIndex + 1) / totalQuestions) * 100;

  const persona = savedState.dominantTrait
    ? QUIZ_PERSONAS[savedState.dominantTrait]
    : QUIZ_PERSONAS.survivor;

  return (
    <section className="max-w-xl mx-auto px-4 sm:px-6 pt-4 pb-16">
      <div className="zine-sheet rounded-[28px] px-5 sm:px-9 py-7 sm:py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-hand text-3xl sm:text-4xl text-[#353630]">
            LARAVEL QUIZ TIME
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5E54]">
            Pemanasan bentar soal kelas Laravel sebelum lihat dokumentasi!
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="w-36 sm:w-44 h-2.5 rounded-full bg-[#F7F4EC] overflow-hidden border border-[#353630]/35">
              <div
                className="h-full bg-[#CFE0EE] rounded-full transition-[width] duration-400 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-xs text-[#5C5E54] tabular-nums">
              {savedState.completed ? '5/5' : `${stepIndex + 1}/${totalQuestions}`}
            </span>
          </div>
        </div>

        <CurvyHeartDivider />

        {!savedState.completed ? (
          <div ref={cardRef} className="space-y-6">
            <div className="space-y-1.5 text-center">
              <p className="font-mono text-xs text-[#5C5E54]">{currentQuestion.kicker}</p>
              <h2 className="font-hand text-xl sm:text-2xl text-[#353630] leading-snug">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-2.5" role="radiogroup" aria-label={currentQuestion.question}>
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl border-[1.5px] transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer min-h-[52px] ${
                      isSelected
                        ? 'bg-[#CFE0EE] border-[#353630] text-[#353630]'
                        : `bg-[#F7F4EC]/70 border-[#353630]/20 text-[#353630] ${OPTION_HOVER_WASH[idx % 4]}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-xs w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-[#353630] text-[#FAF7F0] border-[#353630]'
                            : 'bg-[#FAF7F0] text-[#5C5E54] border-[#353630]/25'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm font-medium leading-snug">{opt.label}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 shrink-0 text-[#353630]" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={stepIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#353630]/30 bg-[#FAF7F0] text-xs sm:text-sm font-medium text-[#353630] hover:bg-[#E8DFF2] disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer min-h-[40px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Balik</span>
              </button>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => onNavigate('archive')}
                  className="text-xs text-[#5C5E54] hover:text-[#353630] underline underline-offset-4 cursor-pointer"
                >
                  Lewati
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedOptionId}
                  className="btn-sky inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none cursor-pointer min-h-[40px]"
                >
                  <span>{stepIndex === totalQuestions - 1 ? 'Lihat hasil' : 'Lanjut'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div ref={cardRef} className="space-y-6 text-center">
            <div className="space-y-1.5">
              <p className="font-mono text-xs text-[#5C5E54]">Kartu Laravel kamu</p>
              <h2 className="font-hand text-3xl sm:text-4xl text-[#353630]">
                {persona.title}
              </h2>
              <p className="text-sm text-[#5C5E54]">{persona.subtitle}</p>
            </div>

            <div className="rounded-2xl bg-[#CFE0EE]/55 border border-[#353630]/25 p-5 space-y-3 text-left">
              <p className="text-sm sm:text-base text-[#353630] leading-relaxed">
                {persona.description}
              </p>
              <p className="font-mono text-xs text-[#353630]/80 pt-2 border-t border-dashed border-[#353630]/25 break-words">
                {persona.commitTag}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleRetake}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[#353630]/25 bg-[#FAF7F0] text-xs sm:text-sm font-medium text-[#353630] hover:bg-[#E8DFF2] transition-colors cursor-pointer min-h-[42px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Main lagi</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('archive')}
                className="btn-butter w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
              >
                <span>Buka dokumentasi kita</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
