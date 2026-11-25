import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { PixelHeartMark } from './HandDrawnArt.tsx';
import { PAGE_ORDER, type PageId } from '../types.ts';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onLogoSecretTrigger: () => void;
  rightSlot?: React.ReactNode;
}

const PAGE_LABELS: Record<PageId, string> = {
  welcome: 'Welcome',
  checkin: 'Kabar',
  quiz: 'Quiz Laravel',
  archive: 'Scrapbook',
  notes: 'Instruktur',
  classnotes: 'Kesan & Pesan',
  guestbook: 'Buat Developer',
  goodbye: 'The End',
};

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onLogoSecretTrigger,
  rightSlot,
}) => {
  const [logoClicks, setLogoClicks] = useState(0);

  const stepIndex = PAGE_ORDER.indexOf(currentPage);
  const prevPage = stepIndex > 0 ? PAGE_ORDER[stepIndex - 1] : null;

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const nextClicks = logoClicks + 1;
    if (nextClicks >= 5) {
      setLogoClicks(0);
      onLogoSecretTrigger();
    } else {
      setLogoClicks(nextClicks);
      if (currentPage !== 'welcome') {
        onNavigate('welcome');
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F4EC]/90 backdrop-blur-xs">
      <div className="max-w-3xl mx-auto px-3.5 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {prevPage && (
            <button
              type="button"
              onClick={() => onNavigate(prevPage)}
              aria-label={`Balik ke ${PAGE_LABELS[prevPage]}`}
              className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF7F0] border border-[#353630]/35 text-[#353630] hover:bg-[#CFE0EE] transition-colors shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          <a
            href="/"
            onClick={handleLogoClick}
            className="inline-flex items-center gap-1.5 sm:gap-2 font-hand text-[13px] sm:text-lg text-[#353630] whitespace-nowrap truncate hover:opacity-75 transition-opacity min-w-0"
            title="A Little After Class"
          >
            <PixelHeartMark className="text-[#353630] shrink-0" />
            <span className="truncate">A Little After Class</span>
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <nav aria-label="Progress halaman" className="flex items-center gap-[3px] sm:gap-1.5">
            {PAGE_ORDER.map((pageId, idx) => {
              const isCurrent = pageId === currentPage;
              const isPast = idx < stepIndex;
              return (
                <button
                  key={pageId}
                  type="button"
                  onClick={() => onNavigate(pageId)}
                  aria-label={`Halaman ${idx + 1}: ${PAGE_LABELS[pageId]}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  title={PAGE_LABELS[pageId]}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                    isCurrent
                      ? 'w-3.5 sm:w-6 bg-[#353630]'
                      : isPast
                      ? 'w-1.5 sm:w-2.5 bg-[#A7C6DF] border border-[#353630]/40 hover:bg-[#F3DDA9]'
                      : 'w-1.5 sm:w-2.5 bg-[#353630]/15 hover:bg-[#CFE0EE]'
                  }`}
                />
              );
            })}
          </nav>

          {rightSlot}
        </div>
      </div>
    </header>
  );
};
