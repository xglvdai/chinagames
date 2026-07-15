/**
 * ZenMatch Games API Worker
 * 
 * Endpoints:
 *   GET  /api/leaderboard/:game  → Get top scores
 *   POST /api/scores             → Submit a new score
 *   GET  /api/stats              → Site statistics
 */

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Player-Token',
  'Access-Control-Max-Age': '86400',
};

// Rate limiting — simple in-memory (resets on Worker cold start)
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 30;        // 30 requests per minute
const rateLimitMap = new Map();

function rateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.window > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { window: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

// Response helpers
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

function error(message, status = 400) {
  return json({ error: message }, status);
}

// ===== Database Operations =====
// Note: Replace with D1 bindings when deployed
async function getLeaderboard(db, game, limit = 50) {
  // SQLite query via D1
  const { results } = await db.prepare(
    `SELECT player, score, time_seconds, created_at
     FROM scores
     WHERE game = ?1 AND approved = 1
     ORDER BY score DESC, time_seconds ASC
     LIMIT ?2`
  ).bind(game, limit).all();
  return results;
}

async function submitScore(db, { game, player, score, time_seconds, player_token }) {
  // Validate input
  if (!game || !player || score == null) {
    throw new Error('Missing required fields: game, player, score');
  }
  if (player.length > 20) {
    throw new Error('Player name too long (max 20 characters)');
  }
  if (score < 0 || score > 999999) {
    throw new Error('Invalid score value');
  }

  // Basic profanity filter
  const profanityPattern = /(fuck|shit|ass|dick|cunt|bitch|nigger|porn|xxx)/i;
  if (profanityPattern.test(player)) {
    throw new Error('Inappropriate player name');
  }

  // Check for duplicate submissions (same player_token within 5 minutes for same game)
  if (player_token) {
    const { results } = await db.prepare(
      `SELECT id FROM scores
       WHERE player_token = ?1 AND game = ?2
       AND created_at > datetime('now', '-5 minutes')
       LIMIT 1`
    ).bind(player_token, game).all();
    if (results.length > 0) {
      throw new Error('Please wait before submitting again');
    }
  }

  // Insert
  const result = await db.prepare(
    `INSERT INTO scores (game, player, score, time_seconds, player_token)
     VALUES (?1, ?2, ?3, ?4, ?5)`
  ).bind(game, player.trim(), score, time_seconds || 0, player_token || null).run();

  return { id: result.meta?.last_row_id, message: 'Score submitted successfully!' };
}

async function getStats(db) {
  const { results: totalGames } = await db.prepare(
    `SELECT COUNT(DISTINCT player_token) as players, COUNT(*) as total_scores FROM scores`
  ).all();
  
  const { results: topGame } = await db.prepare(
    `SELECT game, COUNT(*) as plays FROM scores GROUP BY game ORDER BY plays DESC LIMIT 1`
  ).all();

  return {
    total_players: totalGames[0]?.players || 0,
    total_scores: totalGames[0]?.total_scores || 0,
    most_played: topGame[0]?.game || 'mahjong'
  };
}

// ===== Main Handler =====
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Rate limiting
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!rateLimit(ip)) {
      return error('Too many requests. Please try again later.', 429);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // GET /api/leaderboard/:game
      if (request.method === 'GET' && path.startsWith('/api/leaderboard/')) {
        const game = path.split('/api/leaderboard/')[1];
        if (!['mahjong', 'klotski', 'hanzi', 'touhu', 'abacus'].includes(game)) {
          return error('Invalid game name', 404);
        }
        const results = await getLeaderboard(env.DB, game);
        return json(results);
      }

      // POST /api/scores
      if (request.method === 'POST' && path === '/api/scores') {
        const body = await request.json();
        const result = await submitScore(env.DB, body);
        return json(result, 201);
      }

      // GET /api/stats
      if (request.method === 'GET' && path === '/api/stats') {
        const stats = await getStats(env.DB);
        return json(stats);
      }

      // Health check
      if (request.method === 'GET' && path === '/api/health') {
        return json({ status: 'ok', timestamp: Date.now() });
      }

      // 404
      return error('Not found', 404);

    } catch (err) {
      console.error('API Error:', err.message);
      return error(err.message, 500);
    }
  }
};

// ===== Schedule Trigger (optional) =====
// Clean up old unapproved scores and rate limit data
export const scheduled = {
  async scheduled(event, env, ctx) {
    // Clean scores older than 90 days
    await env.DB.prepare(
      `DELETE FROM scores WHERE created_at < datetime('now', '-90 days')`
    ).run();
    console.log('Cleaned up old scores');
  }
};
