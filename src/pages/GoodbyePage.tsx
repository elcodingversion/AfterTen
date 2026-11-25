import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowUp, Heart, PenLine, RotateCcw } from 'lucide-react';
import {
  ColorSwatchHearts,
  CurvyHeartDivider,
  HeartPairInkDoodle,
} from '../components/HandDrawnArt.tsx';
import { PageTurnFooter } from '../components/PageTurnFooter.tsx';
import { type GuestbookNote, type PageId } from '../types.ts';

interface GoodbyePageProps {
  onNavigate: (page: PageId) => void;
  refreshSignal: number;
}

const TYPEWRITER_LINES = [
  'Sepuluh hari bareng kita mungkin udah kelar, time flies so fast ya...',
  'Tapi semua chaos kecilnya, panik bareng pas error 419, sampai senengnya liat hasilnya akhirnya jalan di localhost bakal jadi core memory banget.',
  'Thank you so much ya udah bikin journey singkat ini se-memorable itu.',
  'See you again on the next commit. ♡',
];

const NOTE_CARD_BG: Record<GuestbookNote['noteTone'], string> = {
  sky: 'bg-[#CFE0EE]/85',
  butter: 'bg-[#F3DDA9]/80',
  sage: 'bg-[#DCE5D6]/85',
  lavender: 'bg-[#E8DFF2]/85',
  ivory: 'bg-[#FAF7F0]',
};

const TILT_CLASSES = ['-rotate-[0.8deg]', 'rotate-[0.7deg]', '-rotate-[0.4deg]', 'rotate-[1deg]'];

export const GoodbyePage: React.FC<GoodbyePageProps> = ({
  onNavigate,
  refreshSignal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);

  // Typewriter animation state
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [typingDone, setTypingDone] = useState(false);

  // Approved notes wall state
  const [notes, setNotes] = useState<GuestbookNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [wallFilter, setWallFilter] = useState<'all' | 'instructor' | 'class' | 'developer'>('all');

  const [replayNote, setReplayNote] = useState(false);

  const fetchApprovedNotes = useCallback(async () => {
    setNotesLoading(true);
    setNotesError(null);
    try {
      const res = await fetch('/api/guestbook');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Belum bisa muat catatan.');
      setNotes(data.messages ?? []);
    } catch (err) {
      setNotesError(err instanceof Error ? err.message : 'Gagal nyambung ke server.');
    } finally {
      setNotesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovedNotes();
  }, [fetchApprovedNotes, refreshSignal]);

  // Typewriter character-by-character timer
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setLineIdx(TYPEWRITER_LINES.length);
      setTypingDone(true);
      return;
    }
    if (typingDone) return;

    const currentLine = TYPEWRITER_LINES[lineIdx];
    if (!currentLine) {
      setTypingDone(true);
      return;
    }

    if (charIdx < currentLine.length) {
      const delay = currentLine[charIdx] === '.' || currentLine[charIdx] === ',' ? 85 : 28;
      const timer = window.setTimeout(() => {
        setCharIdx((c) => c + 1);
      }, delay);
      return () => window.clearTimeout(timer);
    }

    const pauseTimer = window.setTimeout(() => {
      if (lineIdx + 1 >= TYPEWRITER_LINES.length) {
        setTypingDone(true);
      } else {
        setLineIdx((l) => l + 1);
        setCharIdx(0);
      }
    }, 420);

    return () => window.clearTimeout(pauseTimer);
  }, [lineIdx, charIdx, typingDone]);

  // Subtle reveal for notes wall
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || notesLoading || notes.length === 0 || !wallRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.lastpage-note-card', {
        y: 14,
        opacity: 0,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    }, wallRef);

    return () => ctx.revert();
  }, [notesLoading, notes.length, wallFilter]);

  const restartTyping = () => {
    setLineIdx(0);
    setCharIdx(0);
    setTypingDone(false);
  };

  const skipTyping = () => {
    setLineIdx(TYPEWRITER_LINES.length);
    setCharIdx(0);
    setTypingDone(true);
  };

  const filteredNotes = useMemo(() => {
    if (wallFilter === 'all') return notes;
    return notes.filter((n) => (n.category || 'developer') === wallFilter);
  }, [notes, wallFilter]);

  const instructorCount = useMemo(
    () => notes.filter((n) => n.category === 'instructor').length,
    [notes]
  );
  const classCount = useMemo(
    () => notes.filter((n) => n.category === 'class').length,
    [notes]
  );
  const devCount = useMemo(
    () => notes.filter((n) => (n.category || 'developer') === 'developer').length,
    [notes]
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      ref={containerRef}
      className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 pb-16"
    >
      <div className="zine-sheet rounded-[28px] px-5 sm:px-9 py-8 sm:py-10 space-y-9">
        {/* Top Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <HeartPairInkDoodle className="w-16 h-14" />
          </div>
          <h1 className="font-hand text-4xl sm:text-5xl text-[#353630] leading-[1.08]">
            AND THAT&rsquo;S A WRAP.
          </h1>
          <p className="font-mono text-xs text-[#5C5E54]">
            Disnaker Junior Web Programming — Laravel Cohort
          </p>
        </div>

        {/* Typewriter Animated Farewell Letter */}
        <div className="rounded-2xl border-[1.5px] border-[#353630]/35 bg-[#F7F4EC] p-4 sm:p-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-dashed border-[#353630]/20">
            <span className="font-mono text-[11px] text-[#5C5E54]">
              closing_note.blade.php
            </span>
            <div className="flex items-center gap-2">
              {!typingDone && (
                <button
                  type="button"
                  onClick={skipTyping}
                  className="font-mono text-[11px] text-[#5C5E54] hover:text-[#353630] underline underline-offset-2 cursor-pointer"
                >
                  tampilkan semua
                </button>
              )}
              {typingDone && (
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

          <div className="space-y-3.5 min-h-[190px] sm:min-h-[170px] text-left break-words">
            {TYPEWRITER_LINES.map((fullLine, idx) => {
              if (!typingDone && idx > lineIdx) return null;

              const isCurrent = !typingDone && idx === lineIdx;
              const visibleText = typingDone
                ? fullLine
                : isCurrent
                ? fullLine.slice(0, charIdx)
                : fullLine;

              const isClosingSignature = idx === TYPEWRITER_LINES.length - 1;

              return (
                <p
                  key={idx}
                  className={
                    isClosingSignature
                      ? 'font-hand text-2xl sm:text-3xl text-[#353630] pt-1'
                      : 'text-sm sm:text-base text-[#353630]/90 leading-relaxed'
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

        <CurvyHeartDivider />

        {/* Approved Notes Wall (Both Kesan & Pesan Kelas + Pesan Buat Developer) */}
        <section className="space-y-6" aria-label="Dinding semua catatan yang masuk">
          <div className="text-center space-y-2">
            <h2 className="font-hand text-2xl sm:text-3xl text-[#353630]">
              DINDING KENANGAN KITA
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5E54] max-w-md mx-auto">
              Semua kesan &amp; pesan buat Pak Yusup &amp; Pak Salman, kelas, maupun catatan buat developer yang udah ditulis nempel di sini.
            </p>
          </div>

          {/* Filter pills between All / Instruktur / Kesan & Pesan / Buat Developer */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setWallFilter('all')}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-colors cursor-pointer ${
                wallFilter === 'all'
                  ? 'bg-[#CFE0EE] border-[#353630] text-[#353630] font-semibold'
                  : 'bg-[#FAF7F0] border-[#353630]/20 text-[#5C5E54] hover:border-[#353630]/45'
              }`}
            >
              Semua ({notes.length})
            </button>
            <button
              type="button"
              onClick={() => setWallFilter('instructor')}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-colors cursor-pointer ${
                wallFilter === 'instructor'
                  ? 'bg-[#E8DFF2] border-[#353630] text-[#353630] font-semibold'
                  : 'bg-[#FAF7F0] border-[#353630]/20 text-[#5C5E54] hover:border-[#353630]/45'
              }`}
            >
              Buat Instruktur ({instructorCount})
            </button>
            <button
              type="button"
              onClick={() => setWallFilter('class')}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-colors cursor-pointer ${
                wallFilter === 'class'
                  ? 'bg-[#F3DDA9] border-[#353630] text-[#353630] font-semibold'
                  : 'bg-[#FAF7F0] border-[#353630]/20 text-[#5C5E54] hover:border-[#353630]/45'
              }`}
            >
              Kesan &amp; Pesan ({classCount})
            </button>
            <button
              type="button"
              onClick={() => setWallFilter('developer')}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-colors cursor-pointer ${
                wallFilter === 'developer'
                  ? 'bg-[#DCE5D6] border-[#353630] text-[#353630] font-semibold'
                  : 'bg-[#FAF7F0] border-[#353630]/20 text-[#5C5E54] hover:border-[#353630]/45'
              }`}
            >
              Buat Developer ({devCount})
            </button>
          </div>

          {notesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border border-[#353630]/15 bg-[#CFE0EE]/40 p-6 h-36 animate-pulse"
                />
              ))}
            </div>
          ) : notesError ? (
            <div className="rounded-2xl border border-[#353630]/20 bg-[#F7F4EC] p-7 text-center space-y-3">
              <p className="font-hand text-xl text-[#353630]">
                Catatan kenangannya belum bisa dimuat
              </p>
              <p className="text-xs text-[#5C5E54]">{notesError}</p>
              <button
                type="button"
                onClick={fetchApprovedNotes}
                className="btn-sky inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Coba lagi</span>
              </button>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#353630]/30 bg-[#F7F4EC]/70 p-8 text-center space-y-3">
              <Heart className="w-5 h-5 mx-auto text-[#5C5E54]" />
              <p className="font-hand text-xl text-[#353630]">
                Belum ada catatan di kategori ini
              </p>
              <p className="text-xs text-[#5C5E54]">
                Yuk tulis kesan pesan atau titip catatan buat developer di halaman sebelumnya!
              </p>
            </div>
          ) : (
            <div ref={wallRef} className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {filteredNotes.map((note, idx) => {
                const bgClass = NOTE_CARD_BG[note.noteTone] ?? NOTE_CARD_BG.sky;
                const tilt = TILT_CLASSES[idx % TILT_CLASSES.length];
                const categoryLabel =
                  note.category === 'class'
                    ? 'Kesan & Pesan Kelas'
                    : note.category === 'instructor'
                    ? 'Buat Instruktur'
                    : 'Buat Developer';

                return (
                  <article
                    key={note.id}
                    className={`lastpage-note-card relative rounded-2xl border-[1.5px] border-[#353630]/25 p-5 transition-transform duration-200 hover:rotate-0 ${bgClass} ${tilt}`}
                  >
                    <div
                      aria-hidden="true"
                      className="w-12 h-3 mx-auto -mt-7 mb-3 rounded-xs bg-[#FAF7F0] border border-[#353630]/25"
                    />

                    <div className="mb-2.5">
                      <span className="inline-block font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#FAF7F0]/90 border border-[#353630]/20 text-[#353630]">
                        {categoryLabel}
                      </span>
                    </div>

                    <p className="text-sm text-[#353630] leading-relaxed whitespace-pre-line break-words">
                      “{note.message}”
                    </p>

                    <div className="mt-4 pt-3 border-t border-dashed border-[#353630]/20 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-hand text-base text-[#353630] break-words min-w-0">
                          — {note.senderName}
                        </span>
                        <span className="font-mono text-[10px] text-[#5C5E54] tabular-nums shrink-0">
                          {new Date(note.createdAt).toLocaleDateString('id-ID', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      {note.favoriteMoment && (
                        <p className="text-xs text-[#5C5E54] break-words">
                          Momen: {note.favoriteMoment}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Quick links to leave a note */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('notes')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF7F0] border border-[#353630]/25 text-xs font-medium text-[#353630] hover:bg-[#E8DFF2]/75 transition-colors cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Tulis buat Instruktur</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('classnotes')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF7F0] border border-[#353630]/25 text-xs font-medium text-[#353630] hover:bg-[#F3DDA9]/75 transition-colors cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Isi Kesan &amp; Pesan</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('guestbook')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF7F0] border border-[#353630]/25 text-xs font-medium text-[#353630] hover:bg-[#CFE0EE] transition-colors cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Tulis buat Developer</span>
            </button>
          </div>
        </section>

        <CurvyHeartDivider />

        {/* Palette & Final Actions */}
        <div className="text-center space-y-5">
          <div className="space-y-2.5">
            <p className="font-hand text-lg text-[#353630] tracking-wide">
              OUR PALETTE
            </p>
            <ColorSwatchHearts />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#353630]/30 bg-[#FAF7F0] text-xs sm:text-sm font-medium text-[#353630] hover:bg-[#E8DFF2]/60 transition-colors cursor-pointer min-h-[42px]"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Balik ke atas</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('welcome')}
              className="btn-sky inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Baca ulang dari awal</span>
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setReplayNote((prev) => !prev)}
              className="font-mono text-xs text-[#5C5E54] hover:text-[#353630] transition-colors cursor-pointer underline decoration-dotted underline-offset-4"
            >
              <code>if (you.miss.us) &#123; come_back(); &#125;</code>
            </button>

            {replayNote && (
              <p className="mt-3 text-xs text-[#5C5E54] max-w-sm mx-auto leading-relaxed">
                Simpen link ini baik-baik ya, buat dibuka lagi kapan pun kamu kangen suasana kelas Laravel 10 hari kita.
              </p>
            )}
          </div>
        </div>

        <PageTurnFooter
          prevPage="guestbook"
          prevLabel="Balik ke pesan developer"
          onNavigate={onNavigate}
        />
      </div>
    </section>
  );
};
