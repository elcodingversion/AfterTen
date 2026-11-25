import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Disc3, Music } from 'lucide-react';
import { BACKGROUND_MUSIC } from '../data/scrapbook-media.ts';

// Gentle built-in lo-fi chord progression fallback if audio fails to load
const LOFI_CHORDS: number[][] = [
  [261.63, 329.63, 392.0, 493.88], // Cmaj7
  [220.0, 261.63, 329.63, 392.0],  // Am7
  [174.61, 220.0, 261.63, 349.23], // Fmaj7
  [196.0, 246.94, 293.66, 392.0],  // G6
];

export const MusicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const synthTimerRef = useRef<number | null>(null);
  const chordStepRef = useRef(0);

  const [hasCustomAudio, setHasCustomAudio] = useState(true);
  const [playing, setPlaying] = useState(false);

  const stopSynth = useCallback(() => {
    if (synthTimerRef.current !== null) {
      window.clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
  }, []);

  const playChord = useCallback((ctx: AudioContext, master: GainNode, freqs: number[]) => {
    const now = ctx.currentTime;
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const start = now + idx * 0.08;
      noteGain.gain.setValueAtTime(0.0001, start);
      noteGain.gain.exponentialRampToValueAtTime(0.055, start + 0.35);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, start + 2.7);

      osc.connect(noteGain);
      noteGain.connect(master);

      osc.start(start);
      osc.stop(start + 2.8);
    });
  }, []);

  const startSynth = useCallback(() => {
    stopSynth();
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = 0.45;
    master.connect(ctx.destination);

    ctxRef.current = ctx;

    chordStepRef.current = 0;
    playChord(ctx, master, LOFI_CHORDS[0]);
    synthTimerRef.current = window.setInterval(() => {
      chordStepRef.current = (chordStepRef.current + 1) % LOFI_CHORDS.length;
      playChord(ctx, master, LOFI_CHORDS[chordStepRef.current]);
    }, 2800);
  }, [playChord, stopSynth]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.55;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopSynth();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [stopSynth]);

  const togglePlay = async () => {
    if (playing) {
      if (audioRef.current) audioRef.current.pause();
      stopSynth();
      setPlaying(false);
      return;
    }

    if (hasCustomAudio && audioRef.current) {
      try {
        await audioRef.current.play();
        setPlaying(true);
        return;
      } catch {
        setHasCustomAudio(false);
      }
    }

    startSynth();
    setPlaying(true);
  };

  return (
    <>
      {hasCustomAudio && (
        <audio
          ref={audioRef}
          src={BACKGROUND_MUSIC.src}
          loop
          preload="auto"
          onError={() => setHasCustomAudio(false)}
        />
      )}

      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? 'Jeda musik' : 'Putar musik'}
        title={playing ? `Pause · ${BACKGROUND_MUSIC.title}` : `Play · ${BACKGROUND_MUSIC.title}`}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
          playing
            ? 'bg-[#CFE0EE] border-[#353630] text-[#353630]'
            : 'bg-[#FAF7F0] border-[#353630]/35 text-[#353630] hover:bg-[#F3DDA9]'
        }`}
      >
        {playing ? (
          <Disc3 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Music className="w-3.5 h-3.5" />
        )}
      </button>
    </>
  );
};
