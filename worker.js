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

    let body;
    try { body = await request.json(); }
    catch { return new Response(JSON.stringify({ error: { message: '请求体解析失败' } }), { status: 400, headers: corsHeaders() }); }

    const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + env.DEEPSEEK_API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    // 透传 DeepSeek 的真实状态码
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
