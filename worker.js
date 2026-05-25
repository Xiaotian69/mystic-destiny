// 内存频率限制：IP -> { ts, count }
const ipCache = new Map();
const RATE_LIMIT = 10;
const WINDOW_MS  = 60_000;
const MAX_TOKENS = 2000;

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-v4-flash";
const ALLOWED_MODELS = new Set(["deepseek-v4-flash", "deepseek-v4-pro"]);

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
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }
    if (request.method === 'GET' || request.method === 'HEAD') {
      return json({ ok: true, service: 'deepseek-proxy' });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    let clientRequest;
    try {
      clientRequest = await parseClientRequest(request);
    } catch (err) {
      return json({ error: { message: err?.message || '请求体解析失败' } }, 400);
    }

    const body = clientRequest.body;
    const reply = (data, status = 200) => {
      if (clientRequest.transport === 'iframe') {
        return htmlBridge(data, status, clientRequest.requestId);
      }
      return json(data, status);
    };

    if (!env?.DEEPSEEK_API_KEY) {
      return reply({ error: { message: 'Cloudflare Secret DEEPSEEK_API_KEY 未配置' } }, 500);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(ip)) {
      return reply({ error: { message: '请求过于频繁，请稍后再试' } }, 429);
    }

    if (!Array.isArray(body?.messages) || body.messages.length === 0) {
      return reply({ error: { message: '无效请求' } }, 400);
    }

    const configuredModel = env?.DEEPSEEK_MODEL || DEFAULT_MODEL;
    const model = ALLOWED_MODELS.has(configuredModel) ? configuredModel : DEFAULT_MODEL;
    const upstreamBody = {
      ...body,
      model,
      stream: false,
      max_tokens: Math.min(body.max_tokens ?? MAX_TOKENS, MAX_TOKENS),
      thinking: body.thinking || { type: 'disabled' },
    };

    let resp;
    try {
      resp = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': 'Bearer ' + env.DEEPSEEK_API_KEY,
        },
        body: JSON.stringify(upstreamBody),
      });
    } catch (err) {
      return reply({ error: { message: 'DeepSeek 上游连接失败：' + (err?.message || '网络异常') } }, 502);
    }

    const raw = await resp.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      return reply({
        error: {
          message: 'DeepSeek 返回了非 JSON 响应',
          detail: raw.slice(0, 300),
        },
      }, resp.status || 502);
    }

    return reply(data, resp.status);
  }
};

async function parseClientRequest(request) {
  const contentType = request.headers.get('Content-Type') || '';
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const transport = String(form.get('transport') || '');
    const requestId = String(form.get('requestId') || '');
    const payloadText = String(form.get('payload') || '');
    if (transport !== 'iframe' || !requestId || !payloadText) {
      throw new Error('表单请求缺少必要参数');
    }
    try {
      return {
        body: JSON.parse(payloadText),
        transport,
        requestId,
      };
    } catch {
      throw new Error('表单 payload 解析失败');
    }
  }

  try {
    return {
      body: await request.json(),
      transport: 'json',
      requestId: '',
    };
  } catch {
    throw new Error('请求体解析失败');
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...corsHeaders() },
  });
}

function htmlBridge(data, status = 200, requestId = '') {
  const payload = JSON.stringify({
    __deepseekProxy: true,
    requestId,
    ok: status >= 200 && status < 300,
    status,
    data,
  }).replace(/</g, '\\u003c');

  return new Response(`<!doctype html><meta charset="utf-8"><script>parent.postMessage(${payload},"*");</script>`, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders(),
    },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
