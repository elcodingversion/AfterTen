import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { type PageId } from '../types.ts';

interface PageTurnFooterProps {
  prevPage?: PageId;
  prevLabel?: string;
  nextPage?: PageId;
  nextLabel?: string;
  onNavigate: (page: PageId) => void;
}

export const PageTurnFooter: React.FC<PageTurnFooterProps> = ({
  prevPage,
  prevLabel,
  nextPage,
  nextLabel,
  onNavigate,
}) => {
  return (
    <div className="mt-10 sm:mt-12 pt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      {prevPage && prevLabel ? (
        <button
          type="button"
          onClick={() => onNavigate(prevPage)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#FAF7F0] border border-[#353630]/35 text-xs sm:text-sm font-medium text-[#353630] hover:bg-[#E8DFF2] transition-colors cursor-pointer min-h-[42px]"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span>{prevLabel}</span>
        </button>
      ) : (
        <div className="hidden sm:block" />
      )}

      {nextPage && nextLabel && (
        <button
          type="button"
          onClick={() => onNavigate(nextPage)}
          className="btn-sky group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
        >
          <span>{nextLabel}</span>
          <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      )}
    </div>
  );
};
