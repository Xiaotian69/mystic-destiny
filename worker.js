// 内存频率限制：IP -> [时间戳, 次数]
const ipCache = new Map();
const RATE_LIMIT = 10;      // 每分钟最多请求次数
const WINDOW_MS = 60_000;   // 时间窗口 1 分钟
const MAX_TOKENS = 1000;    // 单次回复最大 token 数

function checkRateLimit(ip) {
  const now = Date.now();
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
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    if (!env.DEEPSEEK_API_KEY) {
      return new Response(
        JSON.stringify({ error: { message: 'Worker 未配置 DEEPSEEK_API_KEY 环境变量' } }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() } }
      );
    }

    // IP 频率限制
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ error: { message: '请求过于频繁，请稍后再试' } }),
        { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders() } }
      );
    }

    let body;
    try { body = await request.json(); }
    catch { return new Response(JSON.stringify({ error: { message: '请求体解析失败' } }), { status: 400, headers: corsHeaders() }); }

    // 校验请求结构，防止乱发请求
    if (!Array.isArray(body?.messages) || body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: { message: '无效请求' } }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() } }
      );
    }

    // 强制 token 上限，防止单次请求烧光额度
    body.max_tokens = Math.min(body.max_tokens ?? MAX_TOKENS, MAX_TOKENS);

    const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + env.DEEPSEEK_API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    return new Response(JSON.stringify(data), {
      status: resp.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
