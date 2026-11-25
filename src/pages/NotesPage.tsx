import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { CheckCircle2, MailOpen, Send, X } from 'lucide-react';
import { CurvyHeartDivider } from '../components/HandDrawnArt.tsx';
import { PageTurnFooter } from '../components/PageTurnFooter.tsx';
import { type GuestbookNote, type Instructor, type PageId } from '../types.ts';

interface NotesPageProps {
  instructors: Instructor[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onNavigate: (page: PageId) => void;
  onNoteSubmitted?: () => void;
}

const NOTE_TONES: Array<{
  id: GuestbookNote['noteTone'];
  shortLabel: string;
  swatchClass: string;
}> = [
  { id: 'sky', shortLabel: 'Blue', swatchClass: 'bg-[#CFE0EE]' },
  { id: 'butter', shortLabel: 'Butter', swatchClass: 'bg-[#F3DDA9]' },
  { id: 'sage', shortLabel: 'Sage', swatchClass: 'bg-[#DCE5D6]' },
  { id: 'lavender', shortLabel: 'Lilac', swatchClass: 'bg-[#E8DFF2]' },
  { id: 'ivory', shortLabel: 'Ivory', swatchClass: 'bg-[#FAF7F0]' },
];

export const NotesPage: React.FC<NotesPageProps> = ({
  instructors,
  loading,
  error,
  onRetry,
  onNavigate,
  onNoteSubmitted,
}) => {
  const [openedInstructor, setOpenedInstructor] = useState<Instructor | null>(null);
  const [brokenPhoto, setBrokenPhoto] = useState(false);
  const envelopeFlapRef = useRef<HTMLDivElement>(null);
  const letterSheetRef = useRef<HTMLDivElement>(null);

  // User-submitted note form for Pak Yusup & Pak Salman
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [noteTone, setNoteTone] = useState<GuestbookNote['noteTone']>('sage');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const oneInstructor = instructors[0] ?? null;

  useEffect(() => {
    if (!openedInstructor) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const tl = gsap.timeline();
    if (envelopeFlapRef.current) {
      tl.fromTo(
        envelopeFlapRef.current,
        { rotateX: 0 },
        { rotateX: -160, duration: 0.45, ease: 'power2.inOut' }
      );
    }
    if (letterSheetRef.current) {
      tl.fromTo(
        letterSheetRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
        '-=0.15'
      );
    }

    return () => {
      tl.kill();
    };
  }, [openedInstructor]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openedInstructor) {
        setOpenedInstructor(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openedInstructor]);

  useEffect(() => {
    if (!submitSuccess || !successRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    gsap.fromTo(
      successRef.current,
      { scale: 0.94, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.4)' }
    );
  }, [submitSuccess]);

  const handleSubmitInstructorNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (senderName.trim().length < 2) {
      setSubmitError('Ayo isi nama kamu dulu ya sebelum ngirim pesan.');
      return;
    }

    if (message.trim().length < 3) {
      setSubmitError('Tulis pesan singkatnya dulu ya buat instruktur kita.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: senderName.trim(),
          message: message.trim(),
          favoriteMoment: 'Untuk: Pak Salman & Pak Yusup',
          noteTone,
          category: 'instructor',
          website: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal ngirim pesan buat instruktur.');
      }

      setSubmitSuccess(
        'Pesanmu buat instruktur udah aman tersimpan dan langsung nempel di halaman terakhir!'
      );
      setSenderName('');
      setMessage('');
      onNoteSubmitted?.();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ada kendala sebentar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 pb-16">
      <div className="zine-sheet rounded-[28px] px-5 sm:px-9 py-8 sm:py-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-hand text-3xl sm:text-4xl text-[#353630]">
            A SPECIAL NOTE
          </h1>
          <p className="text-sm text-[#5C5E54] max-w-md mx-auto">
            Satu surat kecil buat Pak Salman &amp; Pak Yusup selama 10 hari kita belajar bareng. Klik amplopnya ya.
          </p>
        </div>

        <CurvyHeartDivider />

        {loading ? (
          <div className="max-w-sm mx-auto rounded-2xl border border-[#353630]/15 p-6 h-64 animate-pulse bg-[#CFE0EE]/40" />
        ) : error ? (
          <div className="py-8 text-center space-y-4">
            <p className="font-hand text-2xl text-[#353630]">Belum bisa buka amplopnya</p>
            <p className="text-sm text-[#5C5E54]">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="btn-sky px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer"
            >
              Coba lagi
            </button>
          </div>
        ) : oneInstructor ? (
          <div className="max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => setOpenedInstructor(oneInstructor)}
              className="group w-full text-left rounded-2xl border-[1.5px] border-[#353630]/35 p-5 flex flex-col justify-between gap-5 transition-all duration-200 -rotate-[0.6deg] hover:rotate-0 hover:-translate-y-1 cursor-pointer bg-[#CFE0EE]/75"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-[#353630]/25 bg-[#FAF7F0] flex items-center justify-center shrink-0">
                    {oneInstructor.photoUrl && !brokenPhoto ? (
                      <img
                        src={oneInstructor.photoUrl}
                        alt={oneInstructor.name}
                        referrerPolicy="no-referrer"
                        onError={() => setBrokenPhoto(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-hand text-lg text-[#353630]">01</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-hand text-lg sm:text-xl text-[#353630] leading-tight">
                      {oneInstructor.name}
                    </h2>
                    <p className="text-[11px] text-[#5C5E54] mt-0.5">{oneInstructor.role}</p>
                  </div>
                </div>

                <div
                  className="w-10 h-12 rounded-md border border-dashed border-[#353630]/45 flex flex-col items-center justify-center shrink-0 bg-[#F3DDA9]"
                  aria-hidden="true"
                >
                  <MailOpen className="w-3.5 h-3.5 text-[#353630]" />
                  <span className="font-mono text-[8px] text-[#353630] mt-0.5">NOTE</span>
                </div>
              </div>

              <div className="bg-[#FAF7F0] rounded-xl border border-[#353630]/20 p-4 space-y-1.5">
                <p className="font-hand text-base text-[#353630]">
                  {oneInstructor.salutation || 'Halo Mentor,'}
                </p>
                <p className="text-xs text-[#5C5E54] line-clamp-3 leading-relaxed">
                  {oneInstructor.message}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-[#353630]">
                <span className="font-mono text-[11px] text-[#5C5E54] font-normal">
                  Klik amplop
                </span>
                <span className="group-hover:translate-x-1 transition-transform">
                  Buka suratnya →
                </span>
              </div>
            </button>
          </div>
        ) : null}

        <CurvyHeartDivider />

        {/* User can also write their own note for the instructor */}
        <div className="rounded-2xl border-[1.5px] border-[#353630]/25 bg-[#F7F4EC]/75 p-5 sm:p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="font-hand text-2xl text-[#353630]">
              TITIP PESAN BUAT INSTRUKTUR
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5E54]">
              Kamu juga bisa ikutan nulis ucapan terima kasih atau pesan sendiri buat mentor kita di sini.
            </p>
          </div>

          {submitSuccess ? (
            <div
              ref={successRef}
              className="rounded-2xl bg-[#DCE5D6]/85 border border-[#353630]/25 p-6 space-y-4 text-center"
            >
              <div className="w-11 h-11 mx-auto rounded-full bg-[#353630] text-[#FAF7F0] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-hand text-2xl text-[#353630]">
                  Pesan buat instruktur masuk!
                </h3>
                <p className="text-sm text-[#353630]/90 leading-relaxed">
                  {submitSuccess}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmitSuccess(null)}
                className="btn-butter inline-flex items-center justify-center px-5 py-2 rounded-full text-xs font-semibold cursor-pointer"
              >
                Tulis pesan lagi
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitInstructorNote} className="space-y-4" noValidate>
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="inst-website">Website</label>
                <input
                  id="inst-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="inst-sender"
                  className="block text-xs font-medium text-[#353630] mb-1.5"
                >
                  Nama kamu
                </label>
                <input
                  id="inst-sender"
                  type="text"
                  required
                  maxLength={60}
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Ayo isi nama kamu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F0] border border-[#353630]/20 text-sm text-[#353630] placeholder:text-[#5C5E54]/60 focus:outline-none focus:border-[#353630]"
                />
              </div>

              <div>
                <label
                  htmlFor="inst-message"
                  className="block text-xs font-medium text-[#353630] mb-1.5"
                >
                  Pesan buat Pak Salman &amp; Pak Yusup
                </label>
                <textarea
                  id="inst-message"
                  required
                  rows={3}
                  maxLength={600}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis ucapan makasih atau kesanmu diajar sama Pak Salman & Pak Yusup..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F0] border border-[#353630]/20 text-sm text-[#353630] placeholder:text-[#5C5E54]/60 focus:outline-none focus:border-[#353630] resize-y"
                />
                <div className="mt-1 flex justify-end font-mono text-[11px] text-[#5C5E54] tabular-nums">
                  {message.length} / 600
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-[#353630] mb-2">
                  Warna kertas sticky note
                </span>
                <div className="flex flex-wrap gap-2">
                  {NOTE_TONES.map((tone) => {
                    const active = noteTone === tone.id;
                    return (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => setNoteTone(tone.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-colors cursor-pointer ${
                          active
                            ? 'border-[#353630] bg-[#FAF7F0] font-semibold text-[#353630]'
                            : 'border-[#353630]/20 bg-[#FAF7F0]/70 text-[#5C5E54] hover:border-[#353630]/45'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border border-[#353630]/35 shrink-0 ${tone.swatchClass}`}
                          aria-hidden="true"
                        />
                        <span>{tone.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {submitError && (
                <div
                  role="alert"
                  className="rounded-xl bg-[#F3DDA9]/80 border border-[#353630]/25 px-4 py-2.5 text-xs text-[#353630]"
                >
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-sky w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold disabled:opacity-50 cursor-pointer min-h-[46px]"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Lagi ngirim...' : 'Kirim pesan buat instruktur ♡'}</span>
              </button>

              <p className="text-[11px] text-[#5C5E54] text-center">
                Pesanmu bakal langsung tampil di halaman terakhir (The End) ♡
              </p>
            </form>
          )}
        </div>

        <PageTurnFooter
          prevPage="archive"
          prevLabel="Lihat foto lagi"
          nextPage="classnotes"
          nextLabel="Spill kesan & pesanmu yuk"
          onNavigate={onNavigate}
        />
      </div>

      {openedInstructor && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Surat untuk ${openedInstructor.name}`}
          className="fixed inset-0 z-50 bg-[#353630]/75 backdrop-blur-xs flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setOpenedInstructor(null)}
        >
          <div
            className="relative max-w-xl w-full my-4 sm:my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={envelopeFlapRef}
              aria-hidden="true"
              className="mx-auto w-[90%] h-7 sm:h-8 rounded-t-3xl bg-[#CFE0EE] border-x border-t border-[#353630]/35 origin-bottom"
            />

            <article
              ref={letterSheetRef}
              className="bg-[#FAF7F0] rounded-3xl border-[1.5px] border-[#353630]/35 p-5 sm:p-9 shadow-2xl space-y-5 max-h-[82vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-dashed border-[#353630]/25">
                <div className="space-y-1">
                  <p className="font-mono text-xs text-[#5C5E54]">
                    {openedInstructor.role}
                  </p>
                  <h2 className="font-hand text-2xl sm:text-3xl text-[#353630]">
                    {openedInstructor.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenedInstructor(null)}
                  aria-label="Tutup surat"
                  className="w-9 h-9 rounded-full border border-[#353630]/25 flex items-center justify-center hover:bg-[#CFE0EE] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-[#353630] leading-relaxed">
                <p className="font-hand text-lg">
                  {openedInstructor.salutation || 'Halo Mentor,'}
                </p>

                {openedInstructor.message.split('\n\n').map((para, i) => (
                  <p key={i} className="text-sm sm:text-base text-[#353630]/90 whitespace-pre-line">
                    {para}
                  </p>
                ))}

                <p className="pt-3 font-hand text-base text-[#5C5E54]">
                  {openedInstructor.closing || 'Dengan rasa terima kasih, dari kita semua di kelas'}
                </p>
              </div>
            </article>
          </div>
        </div>
      )}
    </section>
  );
};
