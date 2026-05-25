// 内存频率限制：IP -> { ts, count }
const ipCache = new Map();
const RATE_LIMIT = 10;
const WINDOW_MS  = 60_000;
const MAX_TOKENS = 2000;

const DEEPSEEK_API_KEY = "sk-0903d54ca4324a50bff180bd277c2904";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

function checkRateLimit(ip) {
  const now   = Date.now();
  const entry = ipCache.get(ip);
  if (!entry || now - entry.ts > WINDOW_MS) {
    ipCache.set(ip, { ts: now, count: 1 });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(ip)) {
      return json({ error: { message: '请求过于频繁，请稍后再试' } }, 429);
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ error: { message: '请求体解析失败' } }, 400); }

    if (!Array.isArray(body?.messages) || body.messages.length === 0) {
      return json({ error: { message: '无效请求' } }, 400);
    }

    body.max_tokens = Math.min(body.max_tokens ?? MAX_TOKENS, MAX_TOKENS);
    body.model      = 'deepseek-chat';

    const resp = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + DEEPSEEK_API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    return json(data, resp.status);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
