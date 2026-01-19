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

async function callGroq(env, messages, maxTokens = 600) {
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
      max_tokens: maxTokens,
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

    // Endpoint для генерации статей
    if (request.method === 'POST' && url.pathname === '/generate-article') {
      try {
        const body = await request.json();
        const prompt = body.prompt || '';
        const title = body.title || '';
        const source = body.source || '';

        if (!prompt) {
          return new Response(JSON.stringify({ success: false, error: 'prompt required' }), {
            status: 400,
            headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
          });
        }

        const system = `Ты - профессиональный журналист и аналитик бокса с многолетним опытом. Пиши развернутые аналитические статьи на русском языке для боксёрского клуба RING в Пензе.

КРИТИЧЕСКИ ВАЖНО:
- Статья должна быть 2000-3000 слов (минимум 2000!)
- Это не краткая новость, а полноценная аналитическая статья
- Используй профессиональную терминологию бокса
- Раздели на 4-6 логических разделов с подзаголовками h2 (##)
- Добавь исторический контекст и анализ события
- Включи детали: имена, даты, титулы, весовые категории
- Используй описательный язык, создавай атмосферу
- В конце обязательно упомяни клуб RING в Пензе (тел: +7 (937) 429-11-11)
- Формат ответа: чистый Markdown без дополнительных пояснений

Пиши развернуто, как полноценную журналистскую работу, а не краткую новость.`;

        const answer = await callGroq(env, [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ], 4000); // Увеличен лимит для длинных статей (2000-3000 слов)

        return new Response(JSON.stringify({ success: true, content: answer, response: answer }), {
          status: 200,
          headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: 'Article generation error: ' + e.message }), {
          status: 500,
          headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
        });
      }
    }

    // Endpoint для чата
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

