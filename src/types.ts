export type PageId =
  | 'welcome'
  | 'checkin'
  | 'quiz'
  | 'archive'
  | 'notes'
  | 'classnotes'
  | 'guestbook'
  | 'goodbye';

export interface Participant {
  id: number;
  name: string;
  photoUrl: string | null;
  description: string;
  roleLabel: string | null;
  sortOrder: number;
}

export interface MemoryItem {
  id: number;
  title: string;
  description: string;
  dayNumber: number | null;
  section: 'timeline' | 'gallery' | 'video' | 'behind_screen';
  mediaType: 'photo' | 'video' | 'reel';
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  momentNote: string | null;
  aspectHint: 'landscape' | 'portrait' | 'square' | 'wide';
  sortOrder: number;
}

export interface Instructor {
  id: number;
  name: string;
  photoUrl: string | null;
  role: string;
  salutation: string | null;
  message: string;
  closing: string | null;
  sortOrder: number;
}

export interface GuestbookNote {
  id: number;
  senderName: string;
  message: string;
  favoriteMoment: string | null;
  noteTone: 'ivory' | 'sage' | 'lavender' | 'butter' | 'sky';
  category: 'class' | 'developer' | 'instructor';
  isApproved?: boolean;
  createdAt: string;
}

export interface QuizSavedState {
  answers: Record<number, string>;
  completed: boolean;
  dominantTrait: 'artisan' | 'webphp' | 'blade' | 'survivor' | null;
}

export const PAGE_ROUTES: Record<PageId, string> = {
  welcome: '/',
  checkin: '/halo',
  quiz: '/quiz',
  archive: '/archive',
  notes: '/notes',
  classnotes: '/kesan-pesan',
  guestbook: '/for-developer',
  goodbye: '/goodbye',
};

export const PAGE_ORDER: PageId[] = [
  'welcome',
  'checkin',
  'quiz',
  'archive',
  'notes',
  'classnotes',
  'guestbook',
  'goodbye',
];
