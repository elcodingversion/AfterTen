import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { CheckCircle2, Send } from 'lucide-react';
import { CurvyHeartDivider } from '../components/HandDrawnArt.tsx';
import { PageTurnFooter } from '../components/PageTurnFooter.tsx';
import { type GuestbookNote, type PageId } from '../types.ts';
import { submitGuestbook } from '../lib/client-api.ts';

interface GuestbookPageProps {
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

export const GuestbookPage: React.FC<GuestbookPageProps> = ({
  onNavigate,
  onNoteSubmitted,
}) => {
  const [senderName, setSenderName] = useState('');
  const [favoriteMoment, setFavoriteMoment] = useState('');
  const [message, setMessage] = useState('');
  const [noteTone, setNoteTone] = useState<GuestbookNote['noteTone']>('sky');
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
      setSubmitError('Tulis minimal satu kalimat singkat dulu ya sebelum dikirim.');
      return;
    }

    setSubmitting(true);
    try {
      await submitGuestbook({
        senderName: senderName.trim(),
        message: message.trim(),
        favoriteMoment: favoriteMoment.trim(),
        noteTone,
        category: 'developer',
      });

      setSubmitSuccess(
        'Pesanmu buat developer udah aman tersimpan dan langsung muncul di halaman terakhir!'
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
          <div className="inline-block px-3 py-1 rounded-full bg-[#CFE0EE] border border-[#353630]/25 font-mono text-[11px] text-[#353630]">
            One Last Question Before The End
          </div>
          <h1 className="font-hand text-3xl sm:text-4xl text-[#353630] pt-1">
            ADAKAH YANG MAU DISAMPAIKAN KE DEVELOPER?
          </h1>
          <p className="text-sm text-[#5C5E54] max-w-md mx-auto leading-relaxed">
            Sebelum kita tutup bukunya, titip satu catatan kecil buat teman sekelasmu yang diam-diam bikin sudut kecil internet ini sepulang kelas ya.
          </p>
        </div>

        <CurvyHeartDivider />

        <div className="rounded-2xl border-[1.5px] border-[#353630]/25 bg-[#F7F4EC]/75 p-5 sm:p-6 space-y-5">
          {submitSuccess ? (
            <div
              ref={successRef}
              className="rounded-2xl bg-[#CFE0EE]/85 border border-[#353630]/25 p-6 space-y-4 text-center"
            >
              <div className="w-11 h-11 mx-auto rounded-full bg-[#353630] text-[#FAF7F0] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-hand text-2xl text-[#353630]">
                  Pesanmu udah masuk!
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
                  Tulis pesan lagi
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('goodbye')}
                  className="btn-sky inline-flex items-center justify-center px-5 py-2 rounded-full text-xs font-semibold cursor-pointer"
                >
                  Intip halaman terakhir →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="guestbook-website">Website</label>
                <input
                  id="guestbook-website"
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
                    htmlFor="gb-name"
                    className="block text-xs font-medium text-[#353630] mb-1.5"
                  >
                    Nama kamu
                  </label>
                  <input
                    id="gb-name"
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
                    htmlFor="gb-moment"
                    className="block text-xs font-medium text-[#353630] mb-1.5"
                  >
                    Bagian favorit di web ini <span className="text-[#5C5E54] font-normal">(opsional)</span>
                  </label>
                  <input
                    id="gb-moment"
                    type="text"
                    maxLength={140}
                    value={favoriteMoment}
                    onChange={(e) => setFavoriteMoment(e.target.value)}
                    placeholder="Misal: Scrapbook fotonya lucu!"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F0] border border-[#353630]/20 text-sm text-[#353630] placeholder:text-[#5C5E54]/60 focus:outline-none focus:border-[#353630]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="gb-message"
                  className="block text-xs font-medium text-[#353630] mb-1.5"
                >
                  Pesan buat developer
                </label>
                <textarea
                  id="gb-message"
                  required
                  rows={4}
                  maxLength={600}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ada pesan, semangat, atau kata-kata terakhir buat yang bikin web ini?"
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
                className="btn-sky w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold disabled:opacity-50 cursor-pointer min-h-[46px]"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Lagi ngirim...' : 'Kirim ke developer ♡'}</span>
              </button>

              <p className="text-[11px] text-[#5C5E54] text-center">
                Pesanmu bakal langsung muncul di dinding halaman terakhir ♡
              </p>
            </form>
          )}
        </div>

        <PageTurnFooter
          prevPage="classnotes"
          prevLabel="Balik ke kesan pesan"
          nextPage="goodbye"
          nextLabel="Yuk ke halaman terakhir ♡"
          onNavigate={onNavigate}
        />
      </div>
    </section>
  );
};
