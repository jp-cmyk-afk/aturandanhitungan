import { createHash } from 'node:crypto';
import { eq, gt, lt, sql } from 'drizzle-orm';
import { getDb } from '../../db/index.js';
import { players } from '../../db/schema.js';

export default async (req: Request) => {
  const headers = { 'Cache-Control': 'no-store' };
  if (!['POST', 'DELETE'].includes(req.method)) {
    return new Response('Method not allowed', { status: 405, headers: { ...headers, Allow: 'POST, DELETE' } });
  }
  const session = req.headers.get('X-Player-Session') || '';
  if (!/^[0-9a-f-]{36}$/i.test(session)) {
    return Response.json({ error: 'Sesi pemain tidak valid.' }, { status: 400, headers });
  }
  const id = createHash('sha256').update(session).digest('hex');
  try {
    const db = getDb();
    if (req.method === 'DELETE') {
      await db.delete(players).where(eq(players.id, id));
      return new Response(null, { status: 204, headers });
    }
    let body;
    try { body = await req.json(); } catch {
      return Response.json({ error: 'Data pemain tidak valid.' }, { status: 400, headers });
    }
    if (!body || typeof body.name !== 'string' || !body.name.trim() || body.name.length > 12 ||
        typeof body.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(body.color) ||
        !['x', 'y', 'jumpZ', 'dirX', 'score'].every(key => Number.isFinite(body[key])) ||
        body.x < 0 || body.x > 4800 || body.y < 0 || body.y > 3600 ||
        body.jumpZ < 0 || body.jumpZ > 300 || Math.abs(body.dirX) > 1 || body.score < 0 || body.score > 100000) {
      return Response.json({ error: 'Data pemain tidak valid.' }, { status: 400, headers });
    }
    const state = {
      name: body.name.trim(), color: body.color,
      x: Math.round(body.x), y: Math.round(body.y), jumpZ: Math.round(body.jumpZ),
      dirX: Math.round(body.dirX), score: Math.round(body.score), lastSeen: sql`now()`,
    };
    await db.insert(players).values({ id, ...state }).onConflictDoUpdate({ target: players.id, set: state });
    await db.delete(players).where(lt(players.lastSeen, sql`now() - interval '1 day'`));
    const online = await db.select().from(players).where(gt(players.lastSeen, sql`now() - interval '15 seconds'`));
    return Response.json({ id, players: online }, { headers });
  } catch {
    return Response.json({ error: 'Multiplayer belum terhubung. Mencoba lagi…' }, { status: 503, headers });
  }
};
