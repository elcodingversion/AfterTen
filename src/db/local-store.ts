import fs from 'fs';
import path from 'path';
import { INITIAL_INSTRUCTORS } from '../data/instructors.ts';
import { INITIAL_MEMORIES } from '../data/memories.ts';
import { INITIAL_PARTICIPANTS } from '../data/participants.ts';

const STORE_PATH = path.resolve(process.cwd(), 'src/data/local-archive.json');

export interface LocalStoreData {
  participants: Array<{
    id: number;
    name: string;
    photoUrl: string | null;
    description: string;
    roleLabel: string;
    sortOrder: number;
    createdAt: string;
  }>;
  memories: Array<{
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
    createdAt: string;
  }>;
  instructors: Array<{
    id: number;
    name: string;
    photoUrl: string | null;
    role: string;
    salutation: string;
    message: string;
    closing: string;
    sortOrder: number;
    createdAt: string;
  }>;
  guestbookMessages: Array<{
    id: number;
    senderName: string;
    message: string;
    favoriteMoment: string | null;
    noteTone: 'ivory' | 'sage' | 'lavender' | 'butter' | 'sky';
    category: 'class' | 'developer' | 'instructor';
    isApproved: boolean;
    submittedByUid?: string | null;
    createdAt: string;
  }>;
  users: Array<{
    id: number;
    uid: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
}

const DEFAULT_GUESTBOOK: LocalStoreData['guestbookMessages'] = [];

let inMemoryStore: LocalStoreData | null = null;

function loadStore(): LocalStoreData {
  if (inMemoryStore) {
    return inMemoryStore;
  }

  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, 'utf-8');
      inMemoryStore = JSON.parse(content) as LocalStoreData;
      return inMemoryStore;
    }
  } catch (err) {
    console.warn('Could not read local-archive.json, initializing fresh store.', err);
  }

  const now = new Date().toISOString();
  inMemoryStore = {
    participants: INITIAL_PARTICIPANTS.map((p, idx) => ({
      id: idx + 1,
      name: p.name,
      photoUrl: p.photoUrl,
      description: p.description,
      roleLabel: p.roleLabel,
      sortOrder: p.sortOrder,
      createdAt: now,
    })),
    memories: INITIAL_MEMORIES.map((m, idx) => ({
      id: idx + 1,
      title: m.title,
      description: m.description,
      dayNumber: m.dayNumber,
      section: m.section,
      mediaType: m.mediaType,
      mediaUrl: m.mediaUrl,
      thumbnailUrl: m.thumbnailUrl,
      momentNote: m.momentNote,
      aspectHint: m.aspectHint,
      sortOrder: m.sortOrder,
      createdAt: now,
    })),
    instructors: INITIAL_INSTRUCTORS.map((i, idx) => ({
      id: idx + 1,
      name: i.name,
      photoUrl: i.photoUrl,
      role: i.role,
      salutation: i.salutation,
      message: i.message,
      closing: i.closing,
      sortOrder: i.sortOrder,
      createdAt: now,
    })),
    guestbookMessages: DEFAULT_GUESTBOOK,
    users: [],
  };

  saveStore();
  return inMemoryStore;
}

function saveStore(): void {
  if (!inMemoryStore) return;
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(inMemoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to persist local-archive.json to disk:', err);
  }
}

export const localStore = {
  getArchiveData() {
    const store = loadStore();
    const sortedParticipants = [...store.participants].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const sortedMemories = [...store.memories].sort((a, b) => (a.dayNumber ?? 99) - (b.dayNumber ?? 99) || a.sortOrder - b.sortOrder || a.id - b.id);
    const sortedInstructors = [...store.instructors].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

    return {
      participants: sortedParticipants,
      memories: sortedMemories,
      instructors: sortedInstructors,
    };
  },

  getApprovedGuestbookMessages() {
    const store = loadStore();
    return store.guestbookMessages
      .filter((m) => m.isApproved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || b.id - a.id);
  },

  createGuestbookSubmission(input: {
    senderName: string;
    message: string;
    favoriteMoment: string | null;
    noteTone: string;
    category: 'class' | 'developer' | 'instructor';
  }) {
    const store = loadStore();
    const newId = store.guestbookMessages.reduce((max, m) => Math.max(max, m.id), 0) + 1;
    const allowedTones: Array<LocalStoreData['guestbookMessages'][0]['noteTone']> = ['ivory', 'sage', 'lavender', 'butter', 'sky'];
    const noteTone = allowedTones.includes(input.noteTone as any)
      ? (input.noteTone as LocalStoreData['guestbookMessages'][0]['noteTone'])
      : 'sky';

    const newNote: LocalStoreData['guestbookMessages'][0] = {
      id: newId,
      senderName: input.senderName,
      message: input.message,
      favoriteMoment: input.favoriteMoment,
      noteTone,
      category: input.category,
      isApproved: true,
      createdAt: new Date().toISOString(),
    };

    store.guestbookMessages.unshift(newNote);
    saveStore();

    return {
      id: newNote.id,
      createdAt: new Date(newNote.createdAt),
    };
  },

  getAllGuestbookMessagesAdmin() {
    const store = loadStore();
    return [...store.guestbookMessages].sort((a, b) => {
      if (a.isApproved !== b.isApproved) return a.isApproved ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || b.id - a.id;
    });
  },

  setGuestbookApproval(id: number, isApproved: boolean) {
    const store = loadStore();
    const target = store.guestbookMessages.find((m) => m.id === id);
    if (!target) return null;
    target.isApproved = isApproved;
    saveStore();
    return target;
  },

  deleteGuestbookMessage(id: number) {
    const store = loadStore();
    const index = store.guestbookMessages.findIndex((m) => m.id === id);
    if (index === -1) return null;
    store.guestbookMessages.splice(index, 1);
    saveStore();
    return { id };
  },

  createParticipant(input: {
    name: string;
    photoUrl: string | null;
    description: string;
    roleLabel: string;
  }) {
    const store = loadStore();
    const maxOrder = store.participants.reduce((max, p) => Math.max(max, p.sortOrder), 0);
    const newId = store.participants.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const participant = {
      id: newId,
      name: input.name,
      photoUrl: input.photoUrl,
      description: input.description,
      roleLabel: input.roleLabel,
      sortOrder: maxOrder + 1,
      createdAt: new Date().toISOString(),
    };
    store.participants.push(participant);
    saveStore();
    return participant;
  },

  updateParticipant(
    id: number,
    input: { name: string; photoUrl: string | null; description: string; roleLabel: string }
  ) {
    const store = loadStore();
    const target = store.participants.find((p) => p.id === id);
    if (!target) return null;
    target.name = input.name;
    target.photoUrl = input.photoUrl;
    target.description = input.description;
    target.roleLabel = input.roleLabel;
    saveStore();
    return target;
  },

  deleteParticipant(id: number) {
    const store = loadStore();
    const index = store.participants.findIndex((p) => p.id === id);
    if (index === -1) return null;
    store.participants.splice(index, 1);
    saveStore();
    return { id };
  },

  updateInstructor(
    id: number,
    input: { name: string; photoUrl: string | null; role: string; salutation: string; message: string; closing: string }
  ) {
    const store = loadStore();
    const target = store.instructors.find((i) => i.id === id);
    if (!target) return null;
    target.name = input.name;
    target.photoUrl = input.photoUrl;
    target.role = input.role;
    target.salutation = input.salutation;
    target.message = input.message;
    target.closing = input.closing;
    saveStore();
    return target;
  },

  createMemory(input: {
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
    const store = loadStore();
    const newId = store.memories.reduce((max, m) => Math.max(max, m.id), 0) + 1;
    const memory = {
      id: newId,
      title: input.title,
      description: input.description,
      dayNumber: input.dayNumber,
      section: input.section as any,
      mediaType: input.mediaType as any,
      mediaUrl: input.mediaUrl,
      thumbnailUrl: input.thumbnailUrl,
      momentNote: input.momentNote,
      aspectHint: input.aspectHint as any,
      sortOrder: input.dayNumber ?? 99,
      createdAt: new Date().toISOString(),
    };
    store.memories.push(memory);
    saveStore();
    return memory;
  },

  deleteMemory(id: number) {
    const store = loadStore();
    const index = store.memories.findIndex((m) => m.id === id);
    if (index === -1) return null;
    store.memories.splice(index, 1);
    saveStore();
    return { id };
  },

  getOrCreateUser(uid: string, email: string) {
    const store = loadStore();
    const normalizedEmail = email.trim().toLowerCase();
    const configuredOwner = process.env.OWNER_EMAIL?.trim().toLowerCase();
    const existing = store.users.find((u) => u.uid === uid);

    if (existing) {
      const shouldBeAdmin = configuredOwner ? normalizedEmail === configuredOwner : existing.role === 'admin';
      if (existing.email !== normalizedEmail || (shouldBeAdmin && existing.role !== 'admin')) {
        existing.email = normalizedEmail;
        existing.role = shouldBeAdmin ? 'admin' : existing.role;
        saveStore();
      }
      return existing;
    }

    let assignedRole = 'visitor';
    if (configuredOwner) {
      assignedRole = normalizedEmail === configuredOwner ? 'admin' : 'visitor';
    } else {
      const hasAdmin = store.users.some((u) => u.role === 'admin');
      if (!hasAdmin) {
        assignedRole = 'admin';
      }
    }

    const newId = store.users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
    const newUser = {
      id: newId,
      uid,
      email: normalizedEmail,
      role: assignedRole,
      createdAt: new Date().toISOString(),
    };
    store.users.push(newUser);
    saveStore();
    return newUser;
  },

  getUserByUid(uid: string) {
    const store = loadStore();
    return store.users.find((u) => u.uid === uid) ?? null;
  },
};
