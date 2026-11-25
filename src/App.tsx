import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Footer } from './components/Footer.tsx';
import { CODING_JOKES, OrganicPaperBackdrop } from './components/HandDrawnArt.tsx';
import { MusicPlayer } from './components/MusicPlayer.tsx';
import { Navbar } from './components/Navbar.tsx';
import { ArchivePage } from './pages/ArchivePage.tsx';
import { CheckInPage } from './pages/CheckInPage.tsx';
import { ClassNotesPage } from './pages/ClassNotesPage.tsx';
import { GoodbyePage } from './pages/GoodbyePage.tsx';
import { GuestbookPage } from './pages/GuestbookPage.tsx';
import { NotesPage } from './pages/NotesPage.tsx';
import { QuizPage } from './pages/QuizPage.tsx';
import { WelcomePage } from './pages/WelcomePage.tsx';
import {
  PAGE_ROUTES,
  type Instructor,
  type MemoryItem,
  type PageId,
  type QuizSavedState,
} from './types.ts';

const QUIZ_STORAGE_KEY = 'alac_quiz_state_v2';

function resolvePageFromPath(pathname: string): PageId {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const match = (Object.entries(PAGE_ROUTES) as Array<[PageId, string]>).find(
    ([, route]) => route === clean
  );
  return match ? match[0] : 'welcome';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>(() =>
    resolvePageFromPath(window.location.pathname)
  );

  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [archiveLoading, setArchiveLoading] = useState(true);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const [guestbookRefreshSignal, setGuestbookRefreshSignal] = useState(0);
  const [guestbookCount, setGuestbookCount] = useState(0);

  // Easter egg states
  const [logoSecretOpen, setLogoSecretOpen] = useState(false);
  const [activeJoke, setActiveJoke] = useState<string | null>(null);

  const [quizState, setQuizState] = useState<QuizSavedState>(() => {
    try {
      const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as QuizSavedState;
    } catch {
      // ignore storage failure
    }
    return { answers: {}, completed: false, dominantTrait: null };
  });

  const handleUpdateQuizState = (next: QuizSavedState) => {
    setQuizState(next);
    try {
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage failure
    }
  };

  const fetchArchive = useCallback(async () => {
    setArchiveLoading(true);
    setArchiveError(null);
    try {
      const res = await fetch('/api/archive');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Belum bisa muat isi archive.');
      }
      setMemories(data.memories ?? []);
      setInstructors(data.instructors ?? []);
    } catch (err) {
      setArchiveError(
        err instanceof Error ? err.message : 'Gagal nyambung ke server archive.'
      );
    } finally {
      setArchiveLoading(false);
    }
  }, []);

  const fetchGuestbookCount = useCallback(async () => {
    try {
      const res = await fetch('/api/guestbook');
      const data = await res.json();
      if (res.ok && Array.isArray(data.messages)) {
        setGuestbookCount(data.messages.length);
      }
    } catch {
      // ignore count fetch error
    }
  }, []);

  useEffect(() => {
    fetchArchive();
  }, [fetchArchive]);

  useEffect(() => {
    fetchGuestbookCount();
  }, [fetchGuestbookCount, guestbookRefreshSignal]);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPage(resolvePageFromPath(window.location.pathname));
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (page: PageId) => {
    const targetRoute = PAGE_ROUTES[page];
    if (window.location.pathname !== targetRoute) {
      window.history.pushState({ page }, '', targetRoute);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerRandomJoke = () => {
    const next = CODING_JOKES[Math.floor(Math.random() * CODING_JOKES.length)];
    setActiveJoke(next);
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-[#CFE0EE] selection:text-[#353630]">
      <OrganicPaperBackdrop />

      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onLogoSecretTrigger={() => setLogoSecretOpen(true)}
        rightSlot={<MusicPlayer />}
      />

      <main className="flex-1">
        {currentPage === 'welcome' && (
          <WelcomePage
            onNavigate={navigateTo}
            onTriggerJoke={triggerRandomJoke}
            quizCompleted={quizState.completed}
          />
        )}

        {currentPage === 'checkin' && <CheckInPage onNavigate={navigateTo} />}

        {currentPage === 'quiz' && (
          <QuizPage
            savedState={quizState}
            onUpdateState={handleUpdateQuizState}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'archive' && (
          <ArchivePage
            memories={memories}
            guestbookCount={guestbookCount}
            loading={archiveLoading}
            error={archiveError}
            onRetry={fetchArchive}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'notes' && (
          <NotesPage
            instructors={instructors}
            loading={archiveLoading}
            error={archiveError}
            onRetry={fetchArchive}
            onNavigate={navigateTo}
            onNoteSubmitted={() => setGuestbookRefreshSignal((n) => n + 1)}
          />
        )}

        {currentPage === 'classnotes' && (
          <ClassNotesPage
            onNavigate={navigateTo}
            onNoteSubmitted={() => setGuestbookRefreshSignal((n) => n + 1)}
          />
        )}

        {currentPage === 'guestbook' && (
          <GuestbookPage
            onNavigate={navigateTo}
            onNoteSubmitted={() => setGuestbookRefreshSignal((n) => n + 1)}
          />
        )}

        {currentPage === 'goodbye' && (
          <GoodbyePage
            onNavigate={navigateTo}
            refreshSignal={guestbookRefreshSignal}
          />
        )}
      </main>

      <Footer onNavigate={navigateTo} />

      {/* Easter egg: Random coding joke toast */}
      {activeJoke && (
        <div
          role="status"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-5 sm:right-5 z-50 sm:max-w-sm bg-[#CFE0EE] border-[1.5px] border-[#353630] rounded-2xl p-4 shadow-lg flex items-start gap-3"
        >
          <div className="space-y-1 flex-1">
            <p className="font-mono text-[11px] text-[#353630]/80">✦ Recehan kelas Laravel</p>
            <p className="text-sm text-[#353630] font-medium leading-snug">{activeJoke}</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveJoke(null)}
            aria-label="Tutup joke"
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#353630] hover:bg-[#FAF7F0]/70 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Easter egg: 5-click logo secret modal */}
      {logoSecretOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pesan rahasia dari pembuat web"
          className="fixed inset-0 z-50 bg-[#353630]/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLogoSecretOpen(false)}
        >
          <div
            className="max-w-md w-full bg-[#FAF7F0] rounded-3xl border-[1.5px] border-[#353630] p-6 sm:p-8 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-[#5C5E54]">Klik ke-5 kebuka!</p>
                <h2 className="font-hand text-2xl text-[#353630] mt-0.5">
                  Pesan rahasia dari Helma
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setLogoSecretOpen(false)}
                aria-label="Tutup pesan rahasia"
                className="w-9 h-9 rounded-full border border-[#353630]/20 flex items-center justify-center hover:bg-[#CFE0EE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[#353630]/90 leading-relaxed">
              Eh beneran diklik lima kali dong judulnya! Bikin archive kecil ini sepulang pelatihan Disnaker tuh caraku buat bilang makasih udah bikin 10 hari belajar Laravel, Blade, dan routes/web.php bareng-bareng jadi seru banget.
            </p>
            <p className="font-mono text-xs text-[#5C5E54]">
              — Helma, ditemenin es kopi &amp; php artisan optimize:clear.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
