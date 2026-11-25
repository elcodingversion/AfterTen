import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { CheckCircle2, Send } from 'lucide-react';
import { CurvyHeartDivider } from '../components/HandDrawnArt.tsx';
import { PageTurnFooter } from '../components/PageTurnFooter.tsx';
import { type GuestbookNote, type PageId } from '../types.ts';
import { submitGuestbook } from '../lib/client-api.ts';

interface ClassNotesPageProps {
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

export const ClassNotesPage: React.FC<ClassNotesPageProps> = ({
  onNavigate,
  onNoteSubmitted,
}) => {
  const [senderName, setSenderName] = useState('');
  const [favoriteMoment, setFavoriteMoment] = useState('');
  const [message, setMessage] = useState('');
  const [noteTone, setNoteTone] = useState<GuestbookNote['noteTone']>('butter');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const successRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (senderName.trim().length < 2) {
      setSubmitError('Ayo tulis nama kamu dulu ya sebelum dikirim.');
      return;
    }

    if (message.trim().length < 3) {
      setSubmitError('Tulis kesan atau pesan singkatnya dulu ya sebelum dikirim.');
      return;
    }

    setSubmitting(true);
    try {
      await submitGuestbook({
        senderName: senderName.trim(),
        message: message.trim(),
        favoriteMoment: favoriteMoment.trim(),
        noteTone,
        category: 'class',
      });

      setSubmitSuccess(
        'Kesan & pesanmu udah kesimpen dan langsung nempel di halaman terakhir bareng punya teman-teman lain!'
      );
      setSenderName('');
      setFavoriteMoment('');
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
          <div className="inline-block px-3 py-1 rounded-full bg-[#F3DDA9]/80 border border-[#353630]/25 font-mono text-[11px] text-[#353630]">
            Untuk Kelas Kita Bareng-Bareng
          </div>
          <h1 className="font-hand text-3xl sm:text-4xl text-[#353630] pt-1">
            KESAN &amp; PESAN
          </h1>
          <p className="text-sm text-[#5C5E54] max-w-md mx-auto leading-relaxed">
            Buat kenang-kenangan kita semua—tulis kesan, pesan, atau momen paling berkesan selama 10 hari di kelas Laravel bareng teman-teman.
          </p>
        </div>

        <CurvyHeartDivider />

        <div className="rounded-2xl border-[1.5px] border-[#353630]/25 bg-[#F7F4EC]/75 p-5 sm:p-6 space-y-5">
          {submitSuccess ? (
            <div
              ref={successRef}
              className="rounded-2xl bg-[#DCE5D6]/85 border border-[#353630]/25 p-6 space-y-4 text-center"
            >
              <div className="w-11 h-11 mx-auto rounded-full bg-[#353630] text-[#FAF7F0] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-hand text-2xl text-[#353630]">
                  Catatan buat kelas masuk!
                </h2>
                <p className="text-sm text-[#353630]/90 leading-relaxed">
                  {submitSuccess}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(null)}
                  className="btn-butter inline-flex items-center justify-center px-5 py-2 rounded-full text-xs font-semibold cursor-pointer"
                >
                  Tulis satu lagi
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('guestbook')}
                  className="btn-sky inline-flex items-center justify-center px-5 py-2 rounded-full text-xs font-semibold cursor-pointer"
                >
                  Ada pesan buat developer? →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="classnotes-website">Website</label>
                <input
                  id="classnotes-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="cn-name"
                    className="block text-xs font-medium text-[#353630] mb-1.5"
                  >
                    Nama kamu
                  </label>
                  <input
                    id="cn-name"
                    type="text"
                    required
                    maxLength={60}
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Ayo tulis nama kamu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F0] border border-[#353630]/20 text-sm text-[#353630] placeholder:text-[#5C5E54]/60 focus:outline-none focus:border-[#353630]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cn-moment"
                    className="block text-xs font-medium text-[#353630] mb-1.5"
                  >
                    Momen paling keinget <span className="text-[#5C5E54] font-normal">(opsional)</span>
                  </label>
                  <input
                    id="cn-moment"
                    type="text"
                    maxLength={140}
                    value={favoriteMoment}
                    onChange={(e) => setFavoriteMoment(e.target.value)}
                    placeholder="Misal: Demo day & ngopi bareng"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F0] border border-[#353630]/20 text-sm text-[#353630] placeholder:text-[#5C5E54]/60 focus:outline-none focus:border-[#353630]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="cn-message"
                  className="block text-xs font-medium text-[#353630] mb-1.5"
                >
                  Kesan &amp; pesan buat semua di kelas
                </label>
                <textarea
                  id="cn-message"
                  required
                  rows={4}
                  maxLength={600}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis kesan selama 10 hari ini atau pesan manis buat teman-teman..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F0] border border-[#353630]/20 text-sm text-[#353630] placeholder:text-[#5C5E54]/60 focus:outline-none focus:border-[#353630] resize-y"
                />
                <div className="mt-1 flex justify-end font-mono text-[11px] text-[#5C5E54] tabular-nums">
                  {message.length} / 600
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-[#353630] mb-2">
                  Pilih warna kertas sticky note
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
                className="btn-butter w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold disabled:opacity-50 cursor-pointer min-h-[46px]"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Lagi nyimpen...' : 'Simpan kesan & pesan ♡'}</span>
              </button>

              <p className="text-[11px] text-[#5C5E54] text-center">
                Hasil catatanmu bakal langsung ditampilin di halaman terakhir (The End) ♡
              </p>
            </form>
          )}
        </div>

        <PageTurnFooter
          prevPage="notes"
          prevLabel="Balik ke mentor"
          nextPage="guestbook"
          nextLabel="Ada pesan buat developer?"
          onNavigate={onNavigate}
        />
      </div>
    </section>
  );
};
