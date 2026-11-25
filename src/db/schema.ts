import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  role: text('role').notNull().default('visitor'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const participants = pgTable('participants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  photoUrl: text('photo_url'),
  description: text('description').notNull(),
  roleLabel: text('role_label').default('Junior Web Programmer Cohort'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const memories = pgTable('memories', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  dayNumber: integer('day_number'),
  section: text('section').notNull().default('timeline'), // 'timeline' | 'gallery' | 'video' | 'behind_screen'
  mediaType: text('media_type').notNull().default('photo'), // 'photo' | 'video' | 'reel'
  mediaUrl: text('media_url'),
  thumbnailUrl: text('thumbnail_url'),
  momentNote: text('moment_note'),
  aspectHint: text('aspect_hint').default('landscape'), // 'landscape' | 'portrait' | 'square' | 'wide'
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const instructors = pgTable('instructors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  photoUrl: text('photo_url'),
  role: text('role').notNull(),
  message: text('message').notNull(),
  salutation: text('salutation').default('Dear Instructor,'),
  closing: text('closing').default('With gratitude, from all of us in class'),
  sortOrder: integer('sort_order').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const guestbookMessages = pgTable('guestbook_messages', {
  id: serial('id').primaryKey(),
  senderName: text('sender_name').notNull().default('A fellow learner'),
  message: text('message').notNull(),
  favoriteMoment: text('favorite_moment'),
  noteTone: text('note_tone').notNull().default('sky'), // 'ivory' | 'sage' | 'lavender' | 'butter' | 'sky'
  category: text('category').notNull().default('developer'), // 'class' | 'developer' | 'instructor'
  isApproved: boolean('is_approved').notNull().default(false),
  submittedByUid: text('submitted_by_uid'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  guestbookSubmissions: many(guestbookMessages),
}));
