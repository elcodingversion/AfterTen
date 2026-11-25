import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  createGuestbookSubmission,
  createMemory,
  createParticipant,
  deleteGuestbookMessage,
  deleteMemory,
  deleteParticipant,
  getAllGuestbookMessagesAdmin,
  getApprovedGuestbookMessages,
  getArchiveData,
  setGuestbookApproval,
  updateInstructor,
  updateParticipant,
} from './src/db/archive.ts';
import { requireAdmin, requireAuth, type AuthRequest } from './src/middleware/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));

// Basic in-memory spam rate limiter for guestbook submissions (max 5 notes per 10 mins per IP)
const submissionRateMap = new Map<string, number[]>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (submissionRateMap.get(ip) ?? []).filter((ts) => now - ts < RATE_WINDOW_MS);
  if (timestamps.length >= RATE_MAX_REQUESTS) {
    submissionRateMap.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  submissionRateMap.set(ip, timestamps);
  return false;
}

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F]/g, (ch) => (ch === '\n' ? '\n' : '')).trim().slice(0, maxLength);
}

function sanitizeOptionalUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('/')) {
    return trimmed.slice(0, 500);
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString().slice(0, 500);
    }
    return null;
  } catch {
    return null;
  }
}

function parseIdParam(raw: string): number | null {
  const num = Number(raw);
  if (!Number.isInteger(num) || num <= 0) return null;
  return num;
}

// Public archive endpoints
app.get('/api/archive', async (_req, res) => {
  try {
    const data = await getArchiveData();
    res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load archive.';
    res.status(500).json({ error: message });
  }
});

// Public guestbook (approved only)
app.get('/api/guestbook', async (_req, res) => {
  try {
    const messages = await getApprovedGuestbookMessages();
    res.json({ messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load guestbook.';
    res.status(500).json({ error: message });
  }
});

// Public guestbook submission (pending approval)
app.post('/api/guestbook', async (req, res) => {
  const clientIp = req.ip || 'unknown';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      error: 'You have sent several notes recently. Please pause for a few minutes before sending another.',
    });
  }

  // Honeypot anti-spam field check
  if (typeof req.body?.website === 'string' && req.body.website.trim().length > 0) {
    return res.status(201).json({
      ok: true,
      message: 'Your little note has been tucked safely away for the developer.',
    });
  }

  const senderName = sanitizeText(req.body?.senderName, 60);
  const message = sanitizeText(req.body?.message, 600);
  const favoriteMomentRaw = sanitizeText(req.body?.favoriteMoment, 140);
  const favoriteMoment = favoriteMomentRaw.length > 0 ? favoriteMomentRaw : null;

  const allowedTones = new Set(['ivory', 'sage', 'lavender', 'butter', 'sky']);
  const noteTone = allowedTones.has(req.body?.noteTone) ? req.body.noteTone : 'sky';
  const allowedCategories = new Set(['class', 'developer', 'instructor']);
  const category = allowedCategories.has(req.body?.category) ? req.body.category : 'developer';

  if (senderName.length < 2) {
    return res.status(400).json({ error: 'Ayo isi nama kamu dulu ya (minimal 2 karakter).' });
  }

  if (message.length < 3) {
    return res.status(400).json({ error: 'Please write a short message (at least 3 characters) before sending.' });
  }

  // Simple spam link flood check
  const urlMatches = message.match(/https?:\/\//gi);
  if (urlMatches && urlMatches.length > 2) {
    return res.status(400).json({ error: 'Please keep links out of guestbook notes.' });
  }

  try {
    const created = await createGuestbookSubmission({
      senderName,
      message,
      favoriteMoment,
      noteTone,
      category,
    });
    res.status(201).json({
      ok: true,
      id: created.id,
      message: 'Your note is safely saved and now pinned on the last page!',
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Could not save your note.';
    res.status(500).json({ error: errMsg });
  }
});

// Authenticated owner/admin endpoints
app.get('/api/admin/me', requireAuth, (req: AuthRequest, res) => {
  res.json({
    email: req.dbUser?.email,
    role: req.dbUser?.role,
  });
});

app.get('/api/admin/guestbook', requireAdmin, async (_req, res) => {
  try {
    const messages = await getAllGuestbookMessagesAdmin();
    res.json({ messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load notes.';
    res.status(500).json({ error: message });
  }
});

app.patch('/api/admin/guestbook/:id', requireAdmin, async (req, res) => {
  const id = parseIdParam(String(req.params.id));
  if (!id) return res.status(400).json({ error: 'Invalid note ID.' });
  if (typeof req.body?.isApproved !== 'boolean') {
    return res.status(400).json({ error: 'isApproved boolean is required.' });
  }

  try {
    const updated = await setGuestbookApproval(id, req.body.isApproved);
    if (!updated) return res.status(404).json({ error: 'Note not found.' });
    res.json({ note: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update note.';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/admin/guestbook/:id', requireAdmin, async (req, res) => {
  const id = parseIdParam(String(req.params.id));
  if (!id) return res.status(400).json({ error: 'Invalid note ID.' });

  try {
    const deleted = await deleteGuestbookMessage(id);
    if (!deleted) return res.status(404).json({ error: 'Note not found.' });
    res.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not delete note.';
    res.status(500).json({ error: message });
  }
});

app.post('/api/admin/participants', requireAdmin, async (req, res) => {
  const name = sanitizeText(req.body?.name, 80);
  const description = sanitizeText(req.body?.description, 240);
  const roleLabel = sanitizeText(req.body?.roleLabel, 80) || 'Cohort Member';
  const photoUrl = sanitizeOptionalUrl(req.body?.photoUrl);

  if (!name || !description) {
    return res.status(400).json({ error: 'Name and short description are required.' });
  }

  try {
    const participant = await createParticipant({ name, photoUrl, description, roleLabel });
    res.status(201).json({ participant });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not add participant.';
    res.status(500).json({ error: message });
  }
});

app.patch('/api/admin/participants/:id', requireAdmin, async (req, res) => {
  const id = parseIdParam(String(req.params.id));
  if (!id) return res.status(400).json({ error: 'Invalid participant ID.' });

  const name = sanitizeText(req.body?.name, 80);
  const description = sanitizeText(req.body?.description, 240);
  const roleLabel = sanitizeText(req.body?.roleLabel, 80) || 'Cohort Member';
  const photoUrl = sanitizeOptionalUrl(req.body?.photoUrl);

  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required.' });
  }

  try {
    const participant = await updateParticipant(id, { name, photoUrl, description, roleLabel });
    if (!participant) return res.status(404).json({ error: 'Participant not found.' });
    res.json({ participant });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update participant.';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/admin/participants/:id', requireAdmin, async (req, res) => {
  const id = parseIdParam(String(req.params.id));
  if (!id) return res.status(400).json({ error: 'Invalid participant ID.' });

  try {
    const deleted = await deleteParticipant(id);
    if (!deleted) return res.status(404).json({ error: 'Participant not found.' });
    res.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not delete participant.';
    res.status(500).json({ error: message });
  }
});

app.patch('/api/admin/instructors/:id', requireAdmin, async (req, res) => {
  const id = parseIdParam(String(req.params.id));
  if (!id) return res.status(400).json({ error: 'Invalid instructor ID.' });

  const name = sanitizeText(req.body?.name, 80);
  const role = sanitizeText(req.body?.role, 100);
  const salutation = sanitizeText(req.body?.salutation, 80) || 'Dear Mentor,';
  const message = sanitizeText(req.body?.message, 2500);
  const closing = sanitizeText(req.body?.closing, 120) || 'With gratitude, from all of us';
  const photoUrl = sanitizeOptionalUrl(req.body?.photoUrl);

  if (!name || !role || !message) {
    return res.status(400).json({ error: 'Name, role, and letter message are required.' });
  }

  try {
    const instructor = await updateInstructor(id, { name, photoUrl, role, salutation, message, closing });
    if (!instructor) return res.status(404).json({ error: 'Instructor not found.' });
    res.json({ instructor });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Could not update instructor.';
    res.status(500).json({ error: errMsg });
  }
});

app.post('/api/admin/memories', requireAdmin, async (req, res) => {
  const title = sanitizeText(req.body?.title, 100);
  const description = sanitizeText(req.body?.description, 400);
  const momentNote = sanitizeText(req.body?.momentNote, 180) || null;
  const allowedSections = new Set(['timeline', 'gallery', 'video', 'behind_screen']);
  const section = allowedSections.has(req.body?.section) ? req.body.section : 'gallery';
  const allowedTypes = new Set(['photo', 'video', 'reel']);
  const mediaType = allowedTypes.has(req.body?.mediaType) ? req.body.mediaType : 'photo';
  const allowedAspects = new Set(['landscape', 'portrait', 'square', 'wide']);
  const aspectHint = allowedAspects.has(req.body?.aspectHint) ? req.body.aspectHint : 'landscape';

  const rawDay = Number(req.body?.dayNumber);
  const dayNumber = Number.isInteger(rawDay) && rawDay >= 1 && rawDay <= 30 ? rawDay : null;
  const mediaUrl = sanitizeOptionalUrl(req.body?.mediaUrl);
  const thumbnailUrl = sanitizeOptionalUrl(req.body?.thumbnailUrl) ?? mediaUrl;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  try {
    const memory = await createMemory({
      title,
      description,
      dayNumber,
      section,
      mediaType,
      mediaUrl,
      thumbnailUrl,
      momentNote,
      aspectHint,
    });
    res.status(201).json({ memory });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not add memory.';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/admin/memories/:id', requireAdmin, async (req, res) => {
  const id = parseIdParam(String(req.params.id));
  if (!id) return res.status(400).json({ error: 'Invalid memory ID.' });

  try {
    const deleted = await deleteMemory(id);
    if (!deleted) return res.status(404).json({ error: 'Memory not found.' });
    res.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not delete memory.';
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`A Little After Class server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
