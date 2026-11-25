import React, { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { CoffeeInkDoodle, CurvyHeartDivider } from '../components/HandDrawnArt.tsx';
import { PageTurnFooter } from '../components/PageTurnFooter.tsx';
import { type PageId } from '../types.ts';

interface CheckInPageProps {
  onNavigate: (page: PageId) => void;
}

const CHECKIN_LINES = [
  'Halo guys, long time no see... gimana kabarnya nih?',
  "Semoga kalian semua selalu sehat, lagi happy, and everything's going well ya!",
  'Honestly, abis kelas 10 hari kemarin selesai tuh rasanya agak sepi juga. Lowkey kangen suasana kelas yang rame tiap pagi, bingung bareng liat error Laravel, terus ketawa lega pas akhirnya jalan.',
  'Anyway, no rush—cuma pengen nyapa dan nanya kabar dulu sebelum kita throwback ke memori kelas bareng-bareng. Ready?',
];

export const CheckInPage: React.FC<CheckInPageProps> = ({ onNavigate }) => {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setLineIdx(CHECKIN_LINES.length);
      setTypingDone(true);
      return;
    }
    if (typingDone) return;

    const currentLine = CHECKIN_LINES[lineIdx];
    if (!currentLine) {
      setTypingDone(true);
      return;
    }

    if (charIdx < currentLine.length) {
      const ch = currentLine[charIdx];
      const delay = ch === '.' || ch === '?' || ch === '!' || ch === '—' ? 75 : 24;
      const timer = window.setTimeout(() => {
        setCharIdx((c) => c + 1);
      }, delay);
      return () => window.clearTimeout(timer);
    }

    const pauseTimer = window.setTimeout(() => {
      if (lineIdx + 1 >= CHECKIN_LINES.length) {
        setTypingDone(true);
      } else {
        setLineIdx((l) => l + 1);
        setCharIdx(0);
      }
    }, 360);

    return () => window.clearTimeout(pauseTimer);
  }, [lineIdx, charIdx, typingDone]);

  const restartTyping = () => {
    setLineIdx(0);
    setCharIdx(0);
    setTypingDone(false);
  };

  const skipTyping = () => {
    setLineIdx(CHECKIN_LINES.length);
    setCharIdx(0);
    setTypingDone(true);
  };

  return (
    <section className="max-w-xl mx-auto px-4 sm:px-6 pt-4 pb-16">
      <div className="zine-sheet rounded-[28px] px-5 sm:px-9 py-8 sm:py-10 space-y-7">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CFE0EE] border border-[#353630]/25 font-mono text-[11px] text-[#353630]">
            <span>✦ quick check-in</span>
          </div>
          <div className="flex justify-center pt-1">
            <CoffeeInkDoodle />
          </div>
        </div>

        <CurvyHeartDivider />

        {/* Typewriter chat-letter sheet */}
        <div className="rounded-2xl border-[1.5px] border-[#353630]/30 bg-[#F7F4EC] p-4 sm:p-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-dashed border-[#353630]/20">
            <span className="font-mono text-[11px] text-[#5C5E54]">
              halo_kabarnya.txt
            </span>
            <div>
              {!typingDone ? (
                <button
                  type="button"
                  onClick={skipTyping}
                  className="font-mono text-[11px] text-[#5C5E54] hover:text-[#353630] underline underline-offset-2 cursor-pointer"
                >
                  tampilkan semua
                </button>
              ) : (
                <button
                  type="button"
                  onClick={restartTyping}
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-[#353630] bg-[#CFE0EE] px-2.5 py-1 rounded-full border border-[#353630]/25 hover:bg-[#F3DDA9] cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ketik ulang</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 min-h-[210px] break-words">
            {CHECKIN_LINES.map((fullLine, idx) => {
              if (!typingDone && idx > lineIdx) return null;

              const isCurrent = !typingDone && idx === lineIdx;
              const visibleText = typingDone
                ? fullLine
                : isCurrent
                ? fullLine.slice(0, charIdx)
                : fullLine;

              const isLeadGreeting = idx === 0;

              return (
                <p
                  key={idx}
                  className={
                    isLeadGreeting
                      ? 'font-hand text-2xl sm:text-3xl text-[#353630] leading-snug'
                      : 'text-sm sm:text-[15px] text-[#353630]/90 leading-relaxed'
                  }
                >
                  {visibleText}
                  {isCurrent && (
                    <span
                      aria-hidden="true"
                      className="inline-block w-[2px] h-[1.05em] bg-[#353630] ml-0.5 align-middle animate-pulse"
                    />
                  )}
                </p>
              );
            })}
          </div>
        </div>

        <PageTurnFooter
          prevPage="welcome"
          prevLabel="Balik bentar"
          nextPage="quiz"
          nextLabel="Ada beberapa pertanyaan nih"
          onNavigate={onNavigate}
        />
      </div>
    </section>
  );
};
