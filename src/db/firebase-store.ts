import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  where,
  query,
} from 'firebase/firestore';
import { firestore } from '../lib/firebase.ts';
import firebaseConfig from '../../firebase-applet-config.json';
import { INITIAL_INSTRUCTORS } from '../data/instructors.ts';
import { INITIAL_MEMORIES } from '../data/memories.ts';
import { INITIAL_PARTICIPANTS } from '../data/participants.ts';

import dotenv from 'dotenv';
dotenv.config();

let seeded = false;
let firestoreAvailable: boolean | null = null;

export const firebaseStore = {
  async isAvailable(): Promise<boolean> {
    if (firestoreAvailable !== null) {
      return firestoreAvailable;
    }

    // Only attempt Firestore connection if user wants it via env or if projectId is configured
    if (process.env.USE_FIREBASE !== 'true') {
      firestoreAvailable = false;
      return false;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(
        `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/_alac_ping?key=${firebaseConfig.apiKey}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (res.status === 404) {
        console.warn(
          `[ALAC] Firestore Database belum diaktifkan di project Firebase "${firebaseConfig.projectId}".\n` +
          `       Silakan buka https://console.firebase.google.com -> Create Database (Firestore).\n` +
          `       Saat ini menggunakan penyimpanan lokal agar web tetap lancar.`
        );
        firestoreAvailable = false;
        return false;
      }

      if (!res.ok) {
        console.warn(`[ALAC] Firebase Firestore HTTP ${res.status}. Menggunakan penyimpanan lokal.`);
        firestoreAvailable = false;
        return false;
      }

      firestoreAvailable = true;
      console.log(`[ALAC] Terhubung ke Firebase Firestore ("${firebaseConfig.projectId}")!`);
      return true;
    } catch {
      firestoreAvailable = false;
      return false;
    }
  },

  async ensureInitialSeed(): Promise<void> {
    if (seeded) return;
    try {
      const pCol = collection(firestore, 'participants');
      const pSnap = await getDocs(pCol);
      if (pSnap.empty) {
        for (let i = 0; i < INITIAL_PARTICIPANTS.length; i++) {
          const item = INITIAL_PARTICIPANTS[i];
          const id = i + 1;
          await setDoc(doc(firestore, 'participants', String(id)), {
            id,
            name: item.name,
            photoUrl: item.photoUrl,
            description: item.description,
            roleLabel: item.roleLabel,
            sortOrder: item.sortOrder,
            createdAt: new Date().toISOString(),
          });
        }
      }

      const mCol = collection(firestore, 'memories');
      const mSnap = await getDocs(mCol);
      if (mSnap.empty) {
        for (let i = 0; i < INITIAL_MEMORIES.length; i++) {
          const item = INITIAL_MEMORIES[i];
          const id = i + 1;
          await setDoc(doc(firestore, 'memories', String(id)), {
            id,
            title: item.title,
            description: item.description,
            dayNumber: item.dayNumber,
            section: item.section,
            mediaType: item.mediaType,
            mediaUrl: item.mediaUrl,
            thumbnailUrl: item.thumbnailUrl,
            momentNote: item.momentNote,
            aspectHint: item.aspectHint,
            sortOrder: item.sortOrder,
            createdAt: new Date().toISOString(),
          });
        }
      }

      const iCol = collection(firestore, 'instructors');
      const iSnap = await getDocs(iCol);
      if (iSnap.empty) {
        for (let i = 0; i < INITIAL_INSTRUCTORS.length; i++) {
          const item = INITIAL_INSTRUCTORS[i];
          const id = i + 1;
          await setDoc(doc(firestore, 'instructors', String(id)), {
            id,
            name: item.name,
            photoUrl: item.photoUrl,
            role: item.role,
            salutation: item.salutation,
            message: item.message,
            closing: item.closing,
            sortOrder: item.sortOrder,
            createdAt: new Date().toISOString(),
          });
        }
      }

      seeded = true;
    } catch (err) {
      console.warn('Firebase initial seed skipped:', err);
    }
  },

  async getArchiveData() {
    await this.ensureInitialSeed();

    const [pSnap, mSnap, iSnap] = await Promise.all([
      getDocs(collection(firestore, 'participants')),
      getDocs(collection(firestore, 'memories')),
      getDocs(collection(firestore, 'instructors')),
    ]);

    const participants = pSnap.docs
      .map((d) => d.data() as any)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const memories = mSnap.docs
      .map((d) => d.data() as any)
      .sort((a, b) => (a.dayNumber ?? 99) - (b.dayNumber ?? 99) || a.sortOrder - b.sortOrder || a.id - b.id);
    const instructors = iSnap.docs
      .map((d) => d.data() as any)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

    return { participants, memories, instructors };
  },

  async getApprovedGuestbookMessages() {
    const col = collection(firestore, 'guestbook_messages');
    const q = query(col, where('isApproved', '==', true));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => d.data() as any);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || b.id - a.id);
  },

  async createGuestbookSubmission(input: {
    senderName: string;
    message: string;
    favoriteMoment: string | null;
    noteTone: string;
    category: 'class' | 'developer' | 'instructor';
  }) {
    const snap = await getDocs(collection(firestore, 'guestbook_messages'));
    const maxId = snap.docs.reduce((max, d) => Math.max(max, Number(d.data().id) || 0), 0);
    const newId = maxId + 1;
    const createdAt = new Date().toISOString();

    const newDoc = {
      id: newId,
      senderName: input.senderName,
      message: input.message,
      favoriteMoment: input.favoriteMoment,
      noteTone: input.noteTone,
      category: input.category,
      isApproved: true,
      createdAt,
    };

    await setDoc(doc(firestore, 'guestbook_messages', String(newId)), newDoc);
    return {
      id: newId,
      createdAt: new Date(createdAt),
    };
  },

  async getAllGuestbookMessagesAdmin() {
    const snap = await getDocs(collection(firestore, 'guestbook_messages'));
    const list = snap.docs.map((d) => d.data() as any);
    return list.sort((a, b) => {
      if (a.isApproved !== b.isApproved) return a.isApproved ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || b.id - a.id;
    });
  },

  async setGuestbookApproval(id: number, isApproved: boolean) {
    const ref = doc(firestore, 'guestbook_messages', String(id));
    await updateDoc(ref, { isApproved });
    return { id, isApproved };
  },

  async deleteGuestbookMessage(id: number) {
    const ref = doc(firestore, 'guestbook_messages', String(id));
    await deleteDoc(ref);
    return { id };
  },

  async createParticipant(input: {
    name: string;
    photoUrl: string | null;
    description: string;
    roleLabel: string;
  }) {
    const snap = await getDocs(collection(firestore, 'participants'));
    const maxId = snap.docs.reduce((max, d) => Math.max(max, Number(d.data().id) || 0), 0);
    const maxOrder = snap.docs.reduce((max, d) => Math.max(max, Number(d.data().sortOrder) || 0), 0);
    const newId = maxId + 1;
    const participant = {
      id: newId,
      name: input.name,
      photoUrl: input.photoUrl,
      description: input.description,
      roleLabel: input.roleLabel,
      sortOrder: maxOrder + 1,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(firestore, 'participants', String(newId)), participant);
    return participant;
  },

  async updateParticipant(
    id: number,
    input: { name: string; photoUrl: string | null; description: string; roleLabel: string }
  ) {
    const ref = doc(firestore, 'participants', String(id));
    await updateDoc(ref, input as any);
    return { id, ...input };
  },

  async deleteParticipant(id: number) {
    const ref = doc(firestore, 'participants', String(id));
    await deleteDoc(ref);
    return { id };
  },

  async updateInstructor(
    id: number,
    input: { name: string; photoUrl: string | null; role: string; salutation: string; message: string; closing: string }
  ) {
    const ref = doc(firestore, 'instructors', String(id));
    await updateDoc(ref, input as any);
    return { id, ...input };
  },

  async createMemory(input: {
    title: string;
    description: string;
    dayNumber: number | null;
    section: string;
    mediaType: string;
    mediaUrl: string | null;
    thumbnailUrl: string | null;
    momentNote: string | null;
    aspectHint: string;
  }) {
    const snap = await getDocs(collection(firestore, 'memories'));
    const maxId = snap.docs.reduce((max, d) => Math.max(max, Number(d.data().id) || 0), 0);
    const newId = maxId + 1;
    const memory = {
      id: newId,
      title: input.title,
      description: input.description,
      dayNumber: input.dayNumber,
      section: input.section,
      mediaType: input.mediaType,
      mediaUrl: input.mediaUrl,
      thumbnailUrl: input.thumbnailUrl,
      momentNote: input.momentNote,
      aspectHint: input.aspectHint,
      sortOrder: input.dayNumber ?? 99,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(firestore, 'memories', String(newId)), memory);
    return memory;
  },

  async deleteMemory(id: number) {
    const ref = doc(firestore, 'memories', String(id));
    await deleteDoc(ref);
    return { id };
  },

  async getOrCreateUser(uid: string, email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const configuredOwner = process.env.OWNER_EMAIL?.trim().toLowerCase();
    const ref = doc(firestore, 'users', uid);
    const userSnap = await getDocs(collection(firestore, 'users'));
    const existingDoc = userSnap.docs.find((d) => d.data().uid === uid);

    if (existingDoc) {
      const current = existingDoc.data() as any;
      const shouldBeAdmin = configuredOwner ? normalizedEmail === configuredOwner : current.role === 'admin';
      if (current.email !== normalizedEmail || (shouldBeAdmin && current.role !== 'admin')) {
        await updateDoc(ref, {
          email: normalizedEmail,
          role: shouldBeAdmin ? 'admin' : current.role,
        });
        return { ...current, email: normalizedEmail, role: shouldBeAdmin ? 'admin' : current.role };
      }
      return current;
    }

    let assignedRole = 'visitor';
    if (configuredOwner) {
      assignedRole = normalizedEmail === configuredOwner ? 'admin' : 'visitor';
    } else {
      const hasAdmin = userSnap.docs.some((d) => d.data().role === 'admin');
      if (!hasAdmin) {
        assignedRole = 'admin';
      }
    }

    const newUser = {
      id: Date.now(),
      uid,
      email: normalizedEmail,
      role: assignedRole,
      createdAt: new Date().toISOString(),
    };
    await setDoc(ref, newUser);
    return newUser;
  },

  async getUserByUid(uid: string) {
    const snap = await getDocs(collection(firestore, 'users'));
    const userDoc = snap.docs.find((d) => d.data().uid === uid);
    return userDoc ? (userDoc.data() as any) : null;
  },
};
