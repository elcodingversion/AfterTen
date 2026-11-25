import React, { useState } from 'react';
import { type PageId } from '../types.ts';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
}) => {
  const [showWhisper, setShowWhisper] = useState(false);
  const [comeBackTriggered, setComeBackTriggered] = useState(false);

  return (
    <footer className="mt-4 pb-10">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-5 border-t border-dashed border-[#353630]/20 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <a
            href="https://www.instagram.com/helmarezqika/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#5C5E54] hover:text-[#353630] underline decoration-dotted underline-offset-4 transition-colors"
            title="@helmarezqika di Instagram"
          >
            made with love by el ♡
          </a>

          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-[#5C5E54]">
            <button
              type="button"
              onClick={() => setComeBackTriggered((prev) => !prev)}
              className="font-mono hover:text-[#353630] transition-colors cursor-pointer"
              title="Klik buat jalanin"
            >
              <code>if (you.miss.us) &#123; come_back(); &#125;</code>
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setShowWhisper((prev) => !prev)}
              className="font-mono hover:text-[#353630] cursor-pointer"
            >
              psst.txt
            </button>
          </div>
        </div>

        {comeBackTriggered && (
          <div className="rounded-2xl bg-[#CFE0EE]/75 border border-[#353630]/25 px-4 py-3 text-xs text-[#353630] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
            <span>
              <strong className="font-mono font-medium">come_back() jalan:</strong> Tempat kecil ini selalu kebuka kapan pun kamu kangen suasana kelas Laravel kemarin.
            </span>
            <button
              type="button"
              onClick={() => onNavigate('archive')}
              className="self-start sm:self-auto shrink-0 font-semibold underline underline-offset-2 cursor-pointer"
            >
              Buka Scrapbook →
            </button>
          </div>
        )}

        {showWhisper && (
          <div className="rounded-2xl bg-[#E8DFF2]/75 border border-[#353630]/25 px-4 py-3 text-xs text-[#353630] leading-relaxed">
            <span className="font-mono text-[11px] text-[#5C5E54] block mb-1">
              el_note.md
            </span>
            Thank u for showing up and accidentally turning my quiet gap year era into one of my favorite chapters. Nggak nyangka bakal punya new core memories se-random dan se-seru ini bareng kalian—appreciate it more than words can say. — El ♡
          </div>
        )}
      </div>
    </footer>
  );
};
