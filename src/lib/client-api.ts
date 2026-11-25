/**
 * Client-side API — langsung baca/tulis ke Firebase Firestore.
 * Menggantikan semua fetch('/api/...') yang butuh Express server.
 * Dengan ini, Vercel cukup serve static files saja (tidak perlu serverless).
 */
import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { firestore } from './firebase.ts';
import { INITIAL_MEMORIES } from '../data/memories.ts';
import { INITIAL_INSTRUCTORS } from '../data/instructors.ts';
import { INITIAL_PARTICIPANTS } from '../data/participants.ts';

let seedChecked = false;

async function ensureSeed() {
  if (seedChecked) return;
  try {
    // Check if memories collection exists; if empty, seed all data
    const mSnap = await getDocs(collection(firestore, 'memories'));
    if (mSnap.empty) {
      // Seed memories
      for (let i = 0; i < INITIAL_MEMORIES.length; i++) {
        const item = INITIAL_MEMORIES[i];
        await setDoc(doc(firestore, 'memories', String(i + 1)), {
          id: i + 1,
          ...item,
          createdAt: new Date().toISOString(),
        });
      }
      // Seed instructors
      for (let i = 0; i < INITIAL_INSTRUCTORS.length; i++) {
        const item = INITIAL_INSTRUCTORS[i];
        await setDoc(doc(firestore, 'instructors', String(i + 1)), {
          id: i + 1,
          ...item,
          createdAt: new Date().toISOString(),
        });
      }
      // Seed participants
      for (let i = 0; i < INITIAL_PARTICIPANTS.length; i++) {
        const item = INITIAL_PARTICIPANTS[i];
        await setDoc(doc(firestore, 'participants', String(i + 1)), {
          id: i + 1,
          ...item,
          createdAt: new Date().toISOString(),
        });
      }
    }
    seedChecked = true;
  } catch (err) {
    console.warn('[client-api] Seed check failed:', err);
    seedChecked = true; // Don't retry endlessly
  }
}

/** GET /api/archive — ambil semua data archive dari Firestore */
export async function fetchArchive() {
  await ensureSeed();

  const [pSnap, mSnap, iSnap] = await Promise.all([
    getDocs(collection(firestore, 'participants')),
    getDocs(collection(firestore, 'memories')),
    getDocs(collection(firestore, 'instructors')),
  ]);

  const participants = pSnap.docs
    .map((d) => d.data() as any)
    .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (a.id ?? 0) - (b.id ?? 0));
  const memories = mSnap.docs
    .map((d) => d.data() as any)
    .sort(
      (a: any, b: any) =>
        (a.dayNumber ?? 99) - (b.dayNumber ?? 99) ||
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
        (a.id ?? 0) - (b.id ?? 0)
    );
  const instructors = iSnap.docs
    .map((d) => d.data() as any)
    .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (a.id ?? 0) - (b.id ?? 0));

  return { participants, memories, instructors };
}

/** GET /api/guestbook — ambil pesan guestbook yang sudah di-approve */
export async function fetchGuestbook() {
  const col = collection(firestore, 'guestbook_messages');
  const q = query(col, where('isApproved', '==', true));
  const snap = await getDocs(q);
  const messages = snap.docs
    .map((d) => d.data() as any)
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || (b.id ?? 0) - (a.id ?? 0)
    );
  return { messages };
}

/** POST /api/guestbook — kirim pesan guestbook baru */
export async function submitGuestbook(input: {
  senderName: string;
  message: string;
  favoriteMoment?: string;
  noteTone: string;
  category: 'class' | 'developer' | 'instructor';
}) {
  if (input.senderName.length < 2) {
    throw new Error('Ayo isi nama kamu dulu ya (minimal 2 karakter).');
  }
  if (input.message.length < 3) {
    throw new Error('Tulis pesan singkatnya dulu ya (minimal 3 karakter).');
  }

  const snap = await getDocs(collection(firestore, 'guestbook_messages'));
  const maxId = snap.docs.reduce((max, d) => Math.max(max, Number(d.data().id) || 0), 0);
  const newId = maxId + 1;
  const createdAt = new Date().toISOString();

  const newDoc = {
    id: newId,
    senderName: input.senderName,
    message: input.message,
    favoriteMoment: input.favoriteMoment || null,
    noteTone: input.noteTone,
    category: input.category,
    isApproved: true,
    createdAt,
  };

  await setDoc(doc(firestore, 'guestbook_messages', String(newId)), newDoc);

  return {
    ok: true,
    id: newId,
    message: 'Your note is safely saved and now pinned on the last page!',
  };
}
