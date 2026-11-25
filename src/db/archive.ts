import { asc, desc, eq, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { firebaseStore } from './firebase-store.ts';
import { localStore } from './local-store.ts';
import { guestbookMessages, instructors, memories, participants } from './schema.ts';
import { INITIAL_INSTRUCTORS } from '../data/instructors.ts';
import { INITIAL_MEMORIES } from '../data/memories.ts';
import { INITIAL_PARTICIPANTS } from '../data/participants.ts';

let seedPromise: Promise<void> | null = null;
let loggedNotice = false;

async function getActiveStoreType(): Promise<'postgres' | 'firebase' | 'local'> {
  if (db) {
    return 'postgres';
  }
  try {
    const fbOk = await firebaseStore.isAvailable();
    if (fbOk) {
      return 'firebase';
    }
  } catch {
    // ignore
  }
  if (!loggedNotice) {
    loggedNotice = true;
    console.log('[ALAC] Running with local JSON store for archive and guestbook.');
  }
  return 'local';
}

export async function ensureInitialSeed(): Promise<void> {
  const storeType = await getActiveStoreType();
  if (storeType === 'firebase') {
    await firebaseStore.ensureInitialSeed();
    return;
  }
  if (storeType === 'local' || !db) {
    return;
  }

  if (!seedPromise) {
    seedPromise = (async () => {
      try {
        const [{ count: pCount }] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(participants);
        if (pCount === 0) {
          await db.insert(participants).values(INITIAL_PARTICIPANTS);
        }

        const [{ count: mCount }] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(memories);
        if (mCount === 0) {
          await db.insert(memories).values(INITIAL_MEMORIES);
        }

        const [{ count: iCount }] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(instructors);
        if (iCount === 0) {
          await db.insert(instructors).values(INITIAL_INSTRUCTORS);
        }
      } catch (error) {
        seedPromise = null;
      }
    })();
  }
  return seedPromise;
}

export async function getArchiveData() {
  const storeType = await getActiveStoreType();

  if (storeType === 'firebase') {
    try {
      return await firebaseStore.getArchiveData();
    } catch {
      return localStore.getArchiveData();
    }
  }

  if (storeType === 'postgres' && db) {
    try {
      await ensureInitialSeed();
      const [participantRows, memoryRows, instructorRows] = await Promise.all([
        db.select().from(participants).orderBy(asc(participants.sortOrder), asc(participants.id)),
        db.select().from(memories).orderBy(asc(memories.dayNumber), asc(memories.sortOrder), asc(memories.id)),
        db.select().from(instructors).orderBy(asc(instructors.sortOrder), asc(instructors.id)),
      ]);

      return {
        participants: participantRows,
        memories: memoryRows,
        instructors: instructorRows,
      };
    } catch {
      return localStore.getArchiveData();
    }
  }

  return localStore.getArchiveData();
}

export async function getApprovedGuestbookMessages() {
  const storeType = await getActiveStoreType();

  if (storeType === 'firebase') {
    try {
      return await firebaseStore.getApprovedGuestbookMessages();
    } catch {
      return localStore.getApprovedGuestbookMessages();
    }
  }

  if (storeType === 'postgres' && db) {
    try {
      await ensureInitialSeed();
      return await db
        .select({
          id: guestbookMessages.id,
          senderName: guestbookMessages.senderName,
          message: guestbookMessages.message,
          favoriteMoment: guestbookMessages.favoriteMoment,
          noteTone: guestbookMessages.noteTone,
          category: guestbookMessages.category,
          createdAt: guestbookMessages.createdAt,
        })
        .from(guestbookMessages)
        .where(eq(guestbookMessages.isApproved, true))
        .orderBy(desc(guestbookMessages.createdAt), desc(guestbookMessages.id));
    } catch {
      return localStore.getApprovedGuestbookMessages();
    }
  }

  return localStore.getApprovedGuestbookMessages();
}

export async function createGuestbookSubmission(input: {
  senderName: string;
  message: string;
  favoriteMoment: string | null;
  noteTone: string;
  category: 'class' | 'developer' | 'instructor';
}) {
  const storeType = await getActiveStoreType();

  if (storeType === 'firebase') {
    try {
      return await firebaseStore.createGuestbookSubmission(input);
    } catch {
      return localStore.createGuestbookSubmission(input);
    }
  }

  if (storeType === 'postgres' && db) {
    try {
      const inserted = await db
        .insert(guestbookMessages)
        .values({
          senderName: input.senderName,
          message: input.message,
          favoriteMoment: input.favoriteMoment,
          noteTone: input.noteTone,
          category: input.category,
          isApproved: true,
        })
        .returning({
          id: guestbookMessages.id,
          createdAt: guestbookMessages.createdAt,
        });

      return inserted[0];
    } catch {
      return localStore.createGuestbookSubmission(input);
    }
  }

  return localStore.createGuestbookSubmission(input);
}

export async function getAllGuestbookMessagesAdmin() {
  const storeType = await getActiveStoreType();

  if (storeType === 'firebase') {
    try {
      return await firebaseStore.getAllGuestbookMessagesAdmin();
    } catch {
      return localStore.getAllGuestbookMessagesAdmin();
    }
  }

  if (storeType === 'postgres' && db) {
    try {
      return await db
        .select()
        .from(guestbookMessages)
        .orderBy(asc(guestbookMessages.isApproved), desc(guestbookMessages.createdAt), desc(guestbookMessages.id));
    } catch {
      return localStore.getAllGuestbookMessagesAdmin();
    }
  }

  return localStore.getAllGuestbookMessagesAdmin();
}

export async function setGuestbookApproval(id: number, isApproved: boolean) {
  const storeType = await getActiveStoreType();

  if (storeType === 'firebase') {
    try {
      return await firebaseStore.setGuestbookApproval(id, isApproved);
    } catch {
      return localStore.setGuestbookApproval(id, isApproved);
    }
  }

  if (storeType === 'postgres' && db) {
    try {
      const updated = await db
        .update(guestbookMessages)
        .set({ isApproved })
        .where(eq(guestbookMessages.id, id))
        .returning();
      return updated[0] ?? null;
    } catch {
      return localStore.setGuestbookApproval(id, isApproved);
    }
  }

  return localStore.setGuestbookApproval(id, isApproved);
}

export async function deleteGuestbookMessage(id: number) {
  const storeType = await getActiveStoreType();

  if (storeType === 'firebase') {
    try {
      return await firebaseStore.deleteGuestbookMessage(id);
    } catch {
      return localStore.deleteGuestbookMessage(id);
    }
  }

  if (storeType === 'postgres' && db) {
    try {
      const deleted = await db
        .delete(guestbookMessages)
        .where(eq(guestbookMessages.id, id))
        .returning({ id: guestbookMessages.id });
      return deleted[0] ?? null;
    } catch {
      return localStore.deleteGuestbookMessage(id);
    }
  }

  return localStore.deleteGuestbookMessage(id);
}

export async function createParticipant(input: {
  name: string;
  photoUrl: string | null;
  description: string;
  roleLabel: string;
}) {
  const storeType = await getActiveStoreType();

  if (storeType === 'firebase') {
    try {
      return await firebaseStore.createParticipant(input);
    } catch {
      return localStore.createParticipant(input);
    }
  }

  if (storeType === 'postgres' && db) {
    try {
      const [{ maxOrder }] = await db
        .select({ maxOrder: sql<number>`coalesce(max(${participants.sortOrder}), 0)::int` })
        .from(participants);

      const inserted = await db
        .insert(participants)
        .values({
          name: input.name,
          photoUrl: input.photoUrl,
          description: input.description,
          roleLabel: input.roleLabel,
          sortOrder: maxOrder + 1,
        })
        .returning();
      return inserted[0];
    } catch {
      return localStore.createParticipant(input);
    }
  }

  return localStore.createParticipant(input);
}

export async function updateParticipant(
  id: number,
  input: { name: string; photoUrl: string | null; description: string; roleLabel: string }
) {
  const storeType = await getActiveStoreType();

  if (storeType === 'firebase') {
    try {
      return await firebaseStore.updateParticipant(id, input);
    } catch {
      return localStore.updateParticipant(id, input);
    }
  }

  if (storeType === 'postgres' && db) {
    try {
      const updated = await db
        .update(participants)
        .set({
          name: input.name,
          photoUrl: input.photoUrl,
          description: input.description,
          roleLabel: input.roleLabel,
        })
        .where(eq(participants.id, id))
        .returning();
      return updated[0] ?? null;
    } catch {
      return localStore.updateParticipant(id, input);
    }
  }

  return localStore.updateParticipant(id, input);
}

export async function deleteParticipant(id: number) {
  const storeType = await getActiveStoreType();

  if (storeType === 'firebase') {
    try {
      return await firebaseStore.deleteParticipant(id);
    } catch {
      return localStore.deleteParticipant(id);
    }
  }

  if (storeType === 'postgres' && db) {
    try {
      const deleted = await db
        .delete(participants)
        .where(eq(participants.id, id))
        .returning({ id: participants.id });
      return deleted[0] ?? null;
    } catch {
      return localStore.deleteParticipant(id);
    }
  }

  return localStore.deleteParticipant(id);
}

export async function updateInstructor(
  id: number,
  input: { name: string; photoUrl: string | null; role: string; salutation: string; message: string; closing: string }
) {
  const storeType = await getActiveStoreType();

  if (storeType === 'firebase') {
    try {
      return await firebaseStore.updateInstructor(id, input);
    } catch {
      return localStore.updateInstructor(id, input);
    }
  }

  if (storeType === 'postgres' && db) {
    try {
      const updated = await db
        .update(instructors)
        .set({
          name: input.name,
          photoUrl: input.photoUrl,
          role: input.role,
          salutation: input.salutation,
          message: input.message,
          closing: input.closing,
        })
        .where(eq(instructors.id, id))
        .returning();
      return updated[0] ?? null;
    } catch {
      return localStore.updateInstructor(id, input);
    }
  }

  return localStore.updateInstructor(id, input);
}

export async function createMemory(input: {
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
  const storeType = await getActiveStoreType();

  if (storeType === 'firebase') {
    try {
      return await firebaseStore.createMemory(input);
    } catch {
      return localStore.createMemory(input);
    }
  }

  if (storeType === 'postgres' && db) {
    try {
      const inserted = await db
        .insert(memories)
        .values({
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
        })
        .returning();
      return inserted[0];
    } catch {
      return localStore.createMemory(input);
    }
  }

  return localStore.createMemory(input);
}

export async function deleteMemory(id: number) {
  const storeType = await getActiveStoreType();

  if (storeType === 'firebase') {
    try {
      return await firebaseStore.deleteMemory(id);
    } catch {
      return localStore.deleteMemory(id);
    }
  }

  if (storeType === 'postgres' && db) {
    try {
      const deleted = await db
        .delete(memories)
        .where(eq(memories.id, id))
        .returning({ id: memories.id });
      return deleted[0] ?? null;
    } catch {
      return localStore.deleteMemory(id);
    }
  }

  return localStore.deleteMemory(id);
}
