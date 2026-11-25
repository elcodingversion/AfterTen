import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { CurvyHeartDivider } from '../components/HandDrawnArt.tsx';
import { PageTurnFooter } from '../components/PageTurnFooter.tsx';
import { SCRAPBOOK_PHOTOS, SCRAPBOOK_VIDEOS } from '../data/scrapbook-media.ts';
import { type MemoryItem, type PageId } from '../types.ts';

interface ArchivePageProps {
  memories: MemoryItem[];
  guestbookCount: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onNavigate: (page: PageId) => void;
}

const TAPE_PALETTES = [
  'bg-[#CFE0EE]',
  'bg-[#F3DDA9]',
  'bg-[#DCE5D6]',
  'bg-[#E8DFF2]',
];

export const ArchivePage: React.FC<ArchivePageProps> = ({
  memories,
  guestbookCount,
  loading,
  error,
  onRetry,
  onNavigate,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Film-develop / load animation state per slide transition
  const [isDeveloping, setIsDeveloping] = useState(true);
  const [loadedMap, setLoadedMap] = useState<Record<number, boolean>>({});
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

  // Video scrapbook slider state
  const [videoIndex, setVideoIndex] = useState(0);
  const [activeVideo, setActiveVideo] = useState<MemoryItem | null>(null);

  // Scrapbook torn-note flipper state
  const [noteIndex, setNoteIndex] = useState(0);

  // Fullscreen Polaroid lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const polaroidRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef<number | null>(null);
  const movedDuringDragRef = useRef(false);

  // Read scrapbook photos & 2 videos from src/data/scrapbook-media.ts
  const photoFrames = useMemo<MemoryItem[]>(
    () =>
      SCRAPBOOK_PHOTOS.map((item) => ({
        id: item.id,
        title: 'our moments in ten days',
        description: '',
        dayNumber: null,
        section: 'gallery',
        mediaType: 'photo',
        mediaUrl: item.mediaUrl,
        thumbnailUrl: item.mediaUrl,
        momentNote: null,
        aspectHint: 'landscape',
        sortOrder: item.id,
      })),
    []
  );

  const videoFrames = useMemo<MemoryItem[]>(
    () =>
      SCRAPBOOK_VIDEOS.map((item, idx) => ({
        id: item.id,
        title: `Clip ${idx + 1}`,
        description: '',
        dayNumber: null,
        section: 'video',
        mediaType: 'video',
        mediaUrl: item.mediaUrl,
        thumbnailUrl: item.thumbnailUrl,
        momentNote: null,
        aspectHint: 'wide',
        sortOrder: idx + 1,
      })),
    []
  );

  const scrapbookNotes = useMemo(() => {
    return memories
      .filter((m) => m.section === 'behind_screen')
      .map((m) => ({
        id: `mem-${m.id}`,
        title: m.title,
        text: m.description,
        code: m.momentNote,
        tag: 'Scrapbook note',
      }));
  }, [memories]);

  const activePhoto = photoFrames[photoIndex] ?? null;
  const activeClip = videoFrames[videoIndex] ?? null;
  const activeNote = scrapbookNotes[noteIndex] ?? null;

  const triggerSlide = useCallback(
    (nextIdx: number, dir: 1 | -1) => {
      if (photoFrames.length === 0) return;
      const wrapped = (nextIdx + photoFrames.length) % photoFrames.length;
      if (wrapped === photoIndex) return;
      setSlideDir(dir);
      setIsDeveloping(true);
      setPhotoIndex(wrapped);
    },
    [photoFrames.length, photoIndex]
  );

  // Initial page entrance
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !rootRef.current || loading) return;

    const ctx = gsap.context(() => {
      gsap.from('.scrapbook-reveal', {
        y: 16,
        opacity: 0,
        duration: 0.55,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    }, rootRef);

    return () => ctx.revert();
  }, [loading]);

  // Tactile Polaroid slide-in & develop load animation whenever active photo changes
  useEffect(() => {
    if (!activePhoto) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (polaroidRef.current && !prefersReduced) {
      gsap.fromTo(
        polaroidRef.current,
        {
          x: slideDir * 46,
          rotate: slideDir * 3,
          opacity: 0.35,
          scale: 0.96,
        },
        {
          x: 0,
          rotate: photoIndex % 2 === 0 ? -0.8 : 0.8,
          opacity: 1,
          scale: 1,
          duration: 0.45,
          ease: 'power3.out',
        }
      );
    }

    const minDevelopMs = prefersReduced ? 10 : 380;
    const timer = window.setTimeout(() => {
      if (loadedMap[activePhoto.id] || brokenImages[activePhoto.id]) {
        setIsDeveloping(false);
      }
    }, minDevelopMs);

    return () => window.clearTimeout(timer);
  }, [activePhoto, photoIndex, slideDir, loadedMap, brokenImages]);

  // Keyboard navigation for scrapbook slider & modals
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeVideo && e.key === 'Escape') {
        setActiveVideo(null);
        return;
      }
      if (lightboxOpen && e.key === 'Escape') {
        setLightboxOpen(false);
        return;
      }
      if (e.key === 'ArrowRight' && photoFrames.length > 1) {
        triggerSlide(photoIndex + 1, 1);
      } else if (e.key === 'ArrowLeft' && photoFrames.length > 1) {
        triggerSlide(photoIndex - 1, -1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeVideo, lightboxOpen, photoFrames.length, photoIndex, triggerSlide]);

  // Pointer drag/swipe handlers on the Polaroid frame
  const handlePointerDown = (e: React.PointerEvent) => {
    if (photoFrames.length <= 1) return;
    dragStartXRef.current = e.clientX;
    movedDuringDragRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || dragStartXRef.current === null) return;
    const delta = e.clientX - dragStartXRef.current;
    if (Math.abs(delta) > 6) movedDuringDragRef.current = true;
    setDragOffset(Math.max(-130, Math.min(130, delta)));
  };

  const handlePointerEnd = () => {
    if (!isDragging) return;
    if (dragOffset <= -48) {
      triggerSlide(photoIndex + 1, 1);
    } else if (dragOffset >= 48) {
      triggerSlide(photoIndex - 1, -1);
    }
    dragStartXRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  const handlePhotoImgLoad = (id: number) => {
    setLoadedMap((prev) => ({ ...prev, [id]: true }));
    window.setTimeout(() => {
      setIsDeveloping(false);
    }, 260);
  };

  const markBroken = (id: number) => {
    setBrokenImages((prev) => ({ ...prev, [id]: true }));
    setIsDeveloping(false);
  };

  return (
    <div ref={rootRef} className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 pb-16">
      <div className="zine-sheet rounded-[28px] px-4 sm:px-9 py-7 sm:py-10 space-y-10 overflow-x-clip">
        {/* Top Scrapbook Title */}
        <div className="scrapbook-reveal text-center space-y-2">
          <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-3 py-1 rounded-full bg-[#CFE0EE]/85 border border-[#353630]/30 font-mono text-[11px] text-[#353630]">
            <span>Scrapbook Dokumentasi</span>
            <span aria-hidden="true">·</span>
            <span>Geser fotonya ya</span>
          </div>
          <h1 className="font-hand text-3xl sm:text-5xl text-[#353630] pt-1">
            OUR SCRAPBOOK
            <br />
            FRAMES
          </h1>
        </div>

        {loading ? (
          <div className="py-6 space-y-6">
            <div className="max-w-md mx-auto aspect-[4/4.2] rounded-2xl border border-[#353630]/15 bg-[#FFFDF8] p-4 space-y-4">
              <div className="w-full aspect-[4/3] rounded-xl bg-[#CFE0EE]/55 animate-pulse flex items-center justify-center">
                <span className="font-mono text-xs text-[#5C5E54]">loading frames...</span>
              </div>
              <div className="h-5 w-2/3 rounded bg-[#DCE5D6]/60 animate-pulse" />
              <div className="h-3 w-full rounded bg-[#E8DFF2]/60 animate-pulse" />
            </div>
          </div>
        ) : error ? (
          <div className="py-10 text-center space-y-4">
            <p className="font-hand text-2xl text-[#353630]">Albumnya belum kebuka nih</p>
            <p className="text-sm text-[#5C5E54]">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="btn-sky inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Coba lagi</span>
            </button>
          </div>
        ) : (
          <>
            {/* Interactive Swipeable Polaroid Scrapbook Stack */}
            {activePhoto && (
              <section className="scrapbook-reveal space-y-6" aria-label="Album foto scrapbook">
                <div className="relative max-w-md mx-auto pt-4 pb-2 select-none">
                  {/* Layered scrapbook backing papers behind active frame */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-3 top-6 bottom-4 rounded-2xl bg-[#DCE5D6] border border-[#353630]/20 -rotate-[3.2deg] shadow-xs"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-3 top-6 bottom-4 rounded-2xl bg-[#CFE0EE] border border-[#353630]/20 rotate-[2.6deg] shadow-xs"
                  />

                  {/* Active Draggable Polaroid Frame */}
                  <div
                    ref={polaroidRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerEnd}
                    onPointerCancel={handlePointerEnd}
                    style={{
                      touchAction: 'pan-y',
                      transform: isDragging
                        ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.035}deg)`
                        : undefined,
                    }}
                    className={`relative z-10 bg-[#FFFDF8] rounded-2xl border-[1.5px] border-[#353630]/40 p-3.5 sm:p-4 shadow-md cursor-grab active:cursor-grabbing ${
                      isDragging ? '' : 'transition-transform duration-200'
                    }`}
                  >
                    {/* Top masking tapes */}
                    <div
                      aria-hidden="true"
                      className={`absolute -top-3 left-6 w-16 h-4 rounded-xs border border-[#353630]/25 -rotate-[9deg] ${
                        TAPE_PALETTES[photoIndex % TAPE_PALETTES.length]
                      }`}
                    />
                    <div
                      aria-hidden="true"
                      className={`absolute -top-3 right-6 w-14 h-4 rounded-xs border border-[#353630]/25 rotate-[8deg] ${
                        TAPE_PALETTES[(photoIndex + 1) % TAPE_PALETTES.length]
                      }`}
                    />

                    {/* Polaroid Photo Window + Load/Develop Animation */}
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#353630]/15 bg-[#EFEAD9]">
                      {activePhoto.mediaUrl && !brokenImages[activePhoto.id] ? (
                        <img
                          key={activePhoto.id}
                          src={activePhoto.mediaUrl}
                          alt={activePhoto.title}
                          draggable={false}
                          referrerPolicy="no-referrer"
                          onLoad={() => handlePhotoImgLoad(activePhoto.id)}
                          onError={() => markBroken(activePhoto.id)}
                          className={`w-full h-full object-cover transition-all duration-500 ease-out ${
                            isDeveloping
                              ? 'opacity-45 scale-[1.04] blur-[3px]'
                              : 'opacity-100 scale-100 blur-0'
                          }`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-6 text-center bg-[#CFE0EE]/35">
                          <span className="font-hand text-xl text-[#353630]">
                            {activePhoto.title}
                          </span>
                        </div>
                      )}

                      {/* Film-develop shimmer overlay during photo load */}
                      <div
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#FAF7F0]/55 backdrop-blur-[2px] transition-opacity duration-400 ${
                          isDeveloping ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full border-2 border-[#353630]/25 border-t-[#353630] animate-spin" />
                        <span className="font-mono text-[10px] tracking-wider uppercase text-[#353630]/80 bg-[#F3DDA9]/90 px-2.5 py-0.5 rounded-full border border-[#353630]/20">
                          developing frame...
                        </span>
                      </div>

                      {/* Frame Counter Stamp */}
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#FAF7F0]/90 border border-[#353630]/25 font-mono text-[10px] text-[#353630] tabular-nums">
                        Frame {String(photoIndex + 1).padStart(2, '0')} /{' '}
                        {String(photoFrames.length).padStart(2, '0')}
                      </div>

                      {/* Zoom button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!movedDuringDragRef.current) setLightboxOpen(true);
                        }}
                        aria-label="Perbesar foto"
                        title="Lihat ukuran penuh"
                        className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-[#FAF7F0]/90 border border-[#353630]/30 flex items-center justify-center text-[#353630] hover:bg-[#CFE0EE] transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Polaroid Handwritten Caption Area */}
                    <div className="pt-4 pb-1 px-1 text-center">
                      <h2 className="font-hand text-xl text-[#353630] leading-snug">
                        our moments in ten days
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Slide Controls + Mini Scrapbook Filmstrip */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => triggerSlide(photoIndex - 1, -1)}
                      aria-label="Frame sebelumnya"
                      className="w-10 h-10 rounded-full bg-[#FAF7F0] border border-[#353630]/35 flex items-center justify-center text-[#353630] hover:bg-[#CFE0EE] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="font-mono text-xs text-[#5C5E54] px-2">
                      geser atau klik panah
                    </span>

                    <button
                      type="button"
                      onClick={() => triggerSlide(photoIndex + 1, 1)}
                      aria-label="Frame berikutnya"
                      className="btn-sky w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mini Filmstrip Thumbnails (scrollable edge-to-edge on mobile, centered on desktop) */}
                  <div className="overflow-x-auto py-1.5 -mx-1 px-1">
                    <div className="flex items-center gap-2.5 w-max mx-auto px-1">
                      {photoFrames.map((frame, idx) => {
                        const isActive = idx === photoIndex;
                        return (
                          <button
                            key={frame.id}
                            type="button"
                            onClick={() => triggerSlide(idx, idx > photoIndex ? 1 : -1)}
                            aria-label={`Pilih frame ${idx + 1}: ${frame.title}`}
                            className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-[1.5px] shrink-0 transition-all duration-200 cursor-pointer ${
                              isActive
                                ? 'border-[#353630] scale-105 ring-2 ring-[#CFE0EE]'
                                : 'border-[#353630]/20 opacity-65 hover:opacity-100'
                            }`}
                          >
                            {frame.mediaUrl && !brokenImages[frame.id] ? (
                              <img
                                src={frame.mediaUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-mono text-[10px] text-[#353630]">
                                0{idx + 1}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

            <CurvyHeartDivider />

            {/* Video Clips Scrapbook Frame Slider */}
            {activeClip && (
              <section className="scrapbook-reveal space-y-5" aria-label="Klip video kenangan">
                <div className="text-center">
                  <h2 className="font-hand text-2xl sm:text-3xl text-[#353630]">
                    MOVING FRAMES
                  </h2>
                </div>

                <div className="max-w-md mx-auto bg-[#CFE0EE]/45 rounded-2xl border-[1.5px] border-[#353630]/30 p-3.5 space-y-3 relative">
                  <div
                    aria-hidden="true"
                    className="w-16 h-3.5 mx-auto -mt-5 rounded-xs bg-[#F3DDA9] border border-[#353630]/25"
                  />

                  <button
                    type="button"
                    onClick={() => setActiveVideo(activeClip)}
                    className="group w-full text-left space-y-3 cursor-pointer"
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-[#353630] border border-[#353630]/20">
                      {activeClip.mediaUrl ? (
                        <video
                          key={activeClip.mediaUrl}
                          src={`${activeClip.mediaUrl}#t=0.5`}
                          poster={activeClip.thumbnailUrl ?? undefined}
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover opacity-90 group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      ) : activeClip.thumbnailUrl && !brokenImages[activeClip.id] ? (
                        <img
                          src={activeClip.thumbnailUrl}
                          alt={activeClip.title}
                          referrerPolicy="no-referrer"
                          onError={() => markBroken(activeClip.id)}
                          className="w-full h-full object-cover opacity-85 group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#353630]" />
                      )}
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <span className="w-12 h-12 rounded-full bg-[#F3DDA9] text-[#353630] border-[1.5px] border-[#353630] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 ml-0.5 fill-current" />
                        </span>
                      </div>
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#FAF7F0]/90 font-mono text-[10px] text-[#353630]">
                        Clip {String(videoIndex + 1).padStart(2, '0')} /{' '}
                        {String(videoFrames.length).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="px-1 text-center">
                      <h3 className="font-hand text-lg text-[#353630]">
                        little pieces of us, still in motion.
                      </h3>
                    </div>
                  </button>

                  {videoFrames.length > 1 && (
                    <div className="flex items-center justify-between pt-1 border-t border-dashed border-[#353630]/20">
                      <button
                        type="button"
                        onClick={() =>
                          setVideoIndex(
                            (videoIndex - 1 + videoFrames.length) % videoFrames.length
                          )
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#353630] hover:underline cursor-pointer px-2 py-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Klip sebelumnya</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoIndex((videoIndex + 1) % videoFrames.length)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#353630] hover:underline cursor-pointer px-2 py-1"
                      >
                        <span>Klip berikutnya</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            <CurvyHeartDivider />

            {/* Scrapbook Torn-Note Card (Syncs with back-page notes!) */}
            <section className="scrapbook-reveal space-y-4" aria-label="Sobekan catatan scrapbook">
              <div className="text-center space-y-1">
                <h2 className="font-hand text-2xl sm:text-3xl text-[#353630]">
                  SCRAPBOOK NOTES
                </h2>
                <p className="text-xs text-[#5C5E54]">
                  Potongan catatan &amp; cerita kecil dari kelas.
                </p>
              </div>

              <div className="max-w-md mx-auto">
                {activeNote ? (
                  <div
                    onClick={() => setNoteIndex((noteIndex + 1) % scrapbookNotes.length)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setNoteIndex((noteIndex + 1) % scrapbookNotes.length);
                      }
                    }}
                    className={`relative rounded-2xl border-[1.5px] border-[#353630]/30 p-5 sm:p-6 space-y-3 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 ${
                      TAPE_PALETTES[noteIndex % TAPE_PALETTES.length]
                    }/65`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-[#353630]/20 text-[#353630]">
                        <Sparkles className="w-3 h-3" />
                        <span>{activeNote.tag}</span>
                      </span>
                      <span className="font-mono text-[10px] text-[#5C5E54] tabular-nums">
                        {noteIndex + 1} / {scrapbookNotes.length}
                      </span>
                    </div>

                    <p className="font-hand text-lg sm:text-xl text-[#353630] leading-snug">
                      {activeNote.text}
                    </p>

                    {activeNote.code && (
                      <pre className="px-3 py-2 rounded-xl bg-[#FAF7F0] border border-[#353630]/15 font-mono text-xs text-[#353630] overflow-x-auto">
                        <code>{activeNote.code}</code>
                      </pre>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-[#353630]/20 text-xs text-[#5C5E54]">
                      <span>{activeNote.title}</span>
                      <span className="font-mono text-[11px] text-[#353630]">
                        tap buat lanjut →
                      </span>
                    </div>
                  </div>
                ) : guestbookCount > 0 ? (
                  <div className="relative rounded-2xl border-[1.5px] border-[#353630]/35 bg-[#DCE5D6]/60 p-6 text-center space-y-3">
                    <div
                      aria-hidden="true"
                      className="w-14 h-3.5 mx-auto -mt-8 mb-2 rounded-xs bg-[#F3DDA9] border border-[#353630]/25"
                    />
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-[#353630]/20 text-[#353630]">
                      <Sparkles className="w-3 h-3" />
                      <span>{guestbookCount} catatan tersimpan</span>
                    </span>
                    <p className="font-hand text-xl sm:text-2xl text-[#353630] leading-snug">
                      Udah ada isinya nih, kamu bisa cek di halaman belakang ya!
                    </p>
                    <p className="text-xs text-[#5C5E54]">
                      Catatan buat Pak Yusup &amp; Pak Salman, kelas, dan developer udah nempel di dinding kenangan terakhir ♡
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => onNavigate('goodbye')}
                        className="btn-sky inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer"
                      >
                        <span>Cek di halaman belakang →</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl border-[1.5px] border-dashed border-[#353630]/35 bg-[#F3DDA9]/45 p-6 text-center space-y-2.5">
                    <div
                      aria-hidden="true"
                      className="w-14 h-3.5 mx-auto -mt-8 mb-2 rounded-xs bg-[#CFE0EE] border border-[#353630]/25"
                    />
                    <p className="font-hand text-xl sm:text-2xl text-[#353630] leading-snug">
                      Yah tulisannya masih kosong nih, nanti isi di belakang ya!
                    </p>
                    <p className="text-xs text-[#5C5E54] pt-1">
                      Lanjut ke halaman berikutnya dulu buat nulis buat Pak Yusup &amp; Pak Salman, kelas, atau developer ♡
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        <PageTurnFooter
          prevPage="quiz"
          prevLabel="Balik ke quiz"
          nextPage="notes"
          nextLabel="Baca & titip pesan ke mentor"
          onNavigate={onNavigate}
        />
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
          className="fixed inset-0 z-50 bg-[#353630]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-8"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-[#FAF7F0] rounded-3xl border border-[#353630]/30 p-4 sm:p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="font-mono text-xs text-[#5C5E54] tabular-nums">
                Frame {String(photoIndex + 1).padStart(2, '0')} /{' '}
                {String(photoFrames.length).padStart(2, '0')}
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                aria-label="Tutup foto"
                className="w-9 h-9 rounded-full border border-[#353630]/25 flex items-center justify-center text-[#353630] hover:bg-[#CFE0EE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-[4/3] sm:aspect-[16/10] max-h-[65vh] rounded-2xl overflow-hidden bg-[#22231F]">
              <img
                src={activePhoto.mediaUrl ?? ''}
                alt={activePhoto.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <div>
                <h3 className="font-hand text-lg sm:text-xl text-[#353630]">our moments in ten days</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => triggerSlide(photoIndex - 1, -1)}
                  aria-label="Foto sebelumnya"
                  className="w-9 h-9 rounded-full border border-[#353630]/25 flex items-center justify-center hover:bg-[#CFE0EE] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => triggerSlide(photoIndex + 1, 1)}
                  aria-label="Foto berikutnya"
                  className="w-9 h-9 rounded-full border border-[#353630]/25 flex items-center justify-center hover:bg-[#CFE0EE] cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeVideo && (
        <VideoReelModal clip={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
};

const VideoReelModal: React.FC<{ clip: MemoryItem; onClose: () => void }> = ({
  clip,
  onClose,
}) => {
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const hasRealVideo =
    typeof clip.mediaUrl === 'string' &&
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(clip.mediaUrl);

  useEffect(() => {
    if (hasRealVideo || !playing) return;
    const interval = window.setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1.25));
    }, 150);
    return () => window.clearInterval(interval);
  }, [hasRealVideo, playing]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={clip.title}
      className="fixed inset-0 z-50 bg-[#353630]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-[#FAF7F0] rounded-3xl border border-[#353630]/30 p-4 sm:p-6 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="font-mono text-xs text-[#5C5E54]">Moving Frame</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup video"
            className="w-9 h-9 rounded-full border border-[#353630]/25 flex items-center justify-center text-[#353630] hover:bg-[#CFE0EE] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {hasRealVideo ? (
          <video
            src={clip.mediaUrl ?? undefined}
            poster={clip.thumbnailUrl ?? undefined}
            controls
            autoPlay
            playsInline
            className="w-full max-h-[65vh] aspect-video rounded-2xl bg-black"
          />
        ) : (
          <div className="space-y-3">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#22231F]">
              {clip.thumbnailUrl && (
                <img
                  src={clip.thumbnailUrl}
                  alt={clip.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out"
                  style={{
                    transform: `scale(${1 + (progress / 100) * 0.1}) translateX(${
                      ((progress - 50) / 50) * 1.5
                    }%)`,
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 flex flex-col justify-between p-4">
                <div className="flex justify-between items-center text-[11px] font-mono text-[#F7F4EC]/85">
                  <span>MOTION REEL</span>
                  <span className="tabular-nums">
                    00:{String(Math.floor((progress / 100) * 18)).padStart(2, '0')} / 00:18
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    aria-label={playing ? 'Pause' : 'Play'}
                    className="w-10 h-10 rounded-full bg-[#CFE0EE] text-[#353630] flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    {playing ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 h-1.5 rounded-full bg-white/30 overflow-hidden">
                    <div
                      className="h-full bg-[#CFE0EE] transition-[width] duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#5C5E54] font-mono">
              Preview motion reel. Taruh file .mp4 kamu di folder public/media/videos/ lalu pasang path-nya di src/data/scrapbook-media.ts.
            </p>
          </div>
        )}

        <div>
          <h3 className="font-hand text-xl text-[#353630]">
            little pieces of us, still in motion.
          </h3>
        </div>
      </div>
    </div>
  );
};
