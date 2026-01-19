/**
 * Cloudflare Worker: AI backend for GitHub Pages frontend
 *
 * Deploy:
 * - Create Worker, paste this code
 * - Add secret: GROQ_API_KEY
 * - Optional var: GROQ_MODEL
 * - Set route or use workers.dev URL
 *
 * Endpoint:
 *   POST /chat  { "message": "..." }
 * Response:
 *   { "success": true, "response": "..." }
 */

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  // If you want to lock down to your GitHub Pages domain, replace "*" logic with a whitelist.
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

async function callGroq(env, messages) {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is missing');

  const model = env.GROQ_MODEL || 'llama-3.1-8b-instant';

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method !== 'POST' || url.pathname !== '/chat') {
      return new Response('Not found', { status: 404, headers: corsHeaders(request) });
    }

    try {
      const body = await request.json();
      const message = (body?.message || '').toString().trim();
      if (!message) {
        return new Response(JSON.stringify({ success: false, error: 'message required' }), {
          status: 400,
          headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
        });
      }

      const system = `Ты - помощник боксёрского клуба RING в Пензе. Отвечай кратко и дружелюбно на русском языке.
Телефон: +7 (937) 429-11-11. Если вопрос не по теме - предложи задать конкретнее.`;

      const answer = await callGroq(env, [
        { role: 'system', content: system },
        { role: 'user', content: message },
      ]);

      return new Response(JSON.stringify({ success: true, response: answer }), {
        status: 200,
        headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: 'AI backend error' }), {
        status: 500,
        headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
      });
    }
  },
};

