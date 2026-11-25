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

const DEFAULT_GUESTBOOK: any[] = [];

let seeded = false;

async function ensureSeed() {
  if (seeded) return;
  try {
    const mSnap = await getDocs(collection(firestore, 'memories'));
    if (mSnap.empty) {
      for (let i = 0; i < INITIAL_MEMORIES.length; i++) {
        const item = INITIAL_MEMORIES[i];
        await setDoc(doc(firestore, 'memories', String(i + 1)), {
          id: i + 1,
          ...item,
          createdAt: new Date().toISOString(),
        });
      }
      for (let i = 0; i < INITIAL_INSTRUCTORS.length; i++) {
        const item = INITIAL_INSTRUCTORS[i];
        await setDoc(doc(firestore, 'instructors', String(i + 1)), {
          id: i + 1,
          ...item,
          createdAt: new Date().toISOString(),
        });
      }
      for (let i = 0; i < INITIAL_PARTICIPANTS.length; i++) {
        const item = INITIAL_PARTICIPANTS[i];
        await setDoc(doc(firestore, 'participants', String(i + 1)), {
          id: i + 1,
          ...item,
          createdAt: new Date().toISOString(),
        });
      }
    }
    seeded = true;
  } catch (err) {
    console.warn('[client-api] Seed check skipped/offline:', err);
    seeded = true;
  }
}

/** Ambil semua data archive (memories, instructors, participants) */
export async function fetchArchive() {
  try {
    await ensureSeed();

    const [pSnap, mSnap, iSnap] = await Promise.all([
      getDocs(collection(firestore, 'participants')),
      getDocs(collection(firestore, 'memories')),
      getDocs(collection(firestore, 'instructors')),
    ]);

    const participants = pSnap.empty
      ? INITIAL_PARTICIPANTS
      : pSnap.docs
          .map((d) => d.data() as any)
          .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (a.id ?? 0) - (b.id ?? 0));

    const memories = mSnap.empty
      ? INITIAL_MEMORIES
      : mSnap.docs
          .map((d) => d.data() as any)
          .sort(
            (a: any, b: any) =>
              (a.dayNumber ?? 99) - (b.dayNumber ?? 99) ||
              (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
              (a.id ?? 0) - (b.id ?? 0)
          );

    const instructors = iSnap.empty
      ? INITIAL_INSTRUCTORS
      : iSnap.docs
          .map((d) => d.data() as any)
          .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (a.id ?? 0) - (b.id ?? 0));

    return { participants, memories, instructors };
  } catch (err) {
    console.warn('[client-api] Firestore error, fallback to initial data:', err);
    return {
      participants: INITIAL_PARTICIPANTS,
      memories: INITIAL_MEMORIES,
      instructors: INITIAL_INSTRUCTORS,
    };
  }
}

/** Ambil pesan guestbook yang sudah di-approve */
export async function fetchGuestbook() {
  try {
    const col = collection(firestore, 'guestbook_messages');
    const q = query(col, where('isApproved', '==', true));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { messages: DEFAULT_GUESTBOOK };
    }

    const messages = snap.docs
      .map((d) => d.data() as any)
      .filter(
        (m) =>
          m.senderName !== 'Teman Meja Depan' &&
          m.senderName !== 'Alumni Kelas Laravel'
      )
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || (b.id ?? 0) - (a.id ?? 0)
      );

    return { messages };
  } catch (err) {
    console.warn('[client-api] Failed to fetch guestbook from firestore, fallback to default:', err);
    return { messages: DEFAULT_GUESTBOOK };
  }
}

/** Kirim pesan guestbook baru */
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

  const createdAt = new Date().toISOString();
  let newId = Date.now();

  try {
    const snap = await getDocs(collection(firestore, 'guestbook_messages'));
    const maxId = snap.docs.reduce((max, d) => Math.max(max, Number(d.data().id) || 0), 0);
    newId = maxId + 1;

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
  } catch (err) {
    console.warn('[client-api] Could not write to firestore:', err);
  }

  return {
    ok: true,
    id: newId,
    message: 'Pesanmu berhasil disimpan!',
  };
}
