import { eq, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { firebaseStore } from './firebase-store.ts';
import { localStore } from './local-store.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string) {
  if (db) {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const configuredOwner = process.env.OWNER_EMAIL?.trim().toLowerCase();

      const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);

      if (existing.length > 0) {
        const current = existing[0];
        const shouldBeAdmin = configuredOwner ? normalizedEmail === configuredOwner : current.role === 'admin';
        if (current.email !== normalizedEmail || (shouldBeAdmin && current.role !== 'admin')) {
          const updated = await db
            .update(users)
            .set({
              email: normalizedEmail,
              role: shouldBeAdmin ? 'admin' : current.role,
            })
            .where(eq(users.uid, uid))
            .returning();
          return updated[0];
        }
        return current;
      }

      let assignedRole = 'visitor';
      if (configuredOwner) {
        assignedRole = normalizedEmail === configuredOwner ? 'admin' : 'visitor';
      } else {
        const adminCountResult = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(users)
          .where(eq(users.role, 'admin'));
        if ((adminCountResult[0]?.count ?? 0) === 0) {
          assignedRole = 'admin';
        }
      }

      const result = await db
        .insert(users)
        .values({
          uid,
          email: normalizedEmail,
          role: assignedRole,
        })
        .onConflictDoUpdate({
          target: users.uid,
          set: { email: normalizedEmail },
        })
        .returning();

      return result[0];
    } catch {
      // fallback
    }
  }

  try {
    const isFb = await firebaseStore.isAvailable();
    if (isFb) {
      return await firebaseStore.getOrCreateUser(uid, email);
    }
  } catch {
    // fallback
  }

  return localStore.getOrCreateUser(uid, email);
}

export async function getUserByUid(uid: string) {
  if (db) {
    try {
      const rows = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
      return rows[0] ?? null;
    } catch {
      // fallback
    }
  }

  try {
    const isFb = await firebaseStore.isAvailable();
    if (isFb) {
      return await firebaseStore.getUserByUid(uid);
    }
  } catch {
    // fallback
  }

  return localStore.getUserByUid(uid);
}
