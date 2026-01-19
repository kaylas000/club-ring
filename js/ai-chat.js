/**
 * AI Chat Widget (static site)
 *
 * Frontend runs on GitHub Pages, backend is an external endpoint (Cloudflare Worker / Vercel).
 * Configure endpoint via:
 *   <script>window.AI_CHAT_ENDPOINT="https://YOUR-ENDPOINT/chat";</script>
 * or it will use a placeholder that you should replace.
 */

(function () {
  const DEFAULT_ENDPOINT = 'https://REPLACE_ME.example.com/chat';

  function getEndpoint() {
    const v = (window && window.AI_CHAT_ENDPOINT) || '';
    return (typeof v === 'string' && v.trim()) ? v.trim() : DEFAULT_ENDPOINT;
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === 'class') node.className = v;
        else if (k === 'style') node.setAttribute('style', v);
        else if (k.startsWith('aria-')) node.setAttribute(k, v);
        else if (k === 'text') node.textContent = v;
        else node.setAttribute(k, v);
      });
    }
    (children || []).forEach((c) => node.appendChild(c));
    return node;
  }

  function injectStyles() {
    if (document.getElementById('ai-chat-styles')) return;
    const css = `
      .ai-chat-btn{position:fixed;right:18px;bottom:18px;z-index:9999;width:58px;height:58px;border-radius:999px;border:0;cursor:pointer;
        background:#C8B273;color:#000;box-shadow:0 10px 30px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;
        font-size:22px;font-weight:700}
      .ai-chat-panel{position:fixed;right:18px;bottom:90px;z-index:9999;width:360px;max-width:calc(100vw - 36px);
        height:560px;max-height:calc(100vh - 120px); /* always fit screen (accounts for top + bottom UI) */
        background:#0b0b0b;border:2px solid rgba(200,178,115,.6);border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.55);
        display:none;overflow:hidden}
      .ai-chat-panel.open{display:flex;flex-direction:column}
      .ai-chat-header{background:#C8B273;color:#000;padding:12px 12px;display:flex;align-items:center;justify-content:space-between}
      .ai-chat-title{font-weight:900;line-height:1.1}
      .ai-chat-sub{font-size:12px;opacity:.8}
      .ai-chat-close{border:0;background:transparent;cursor:pointer;font-size:18px;padding:6px;border-radius:10px}
      .ai-chat-close:hover{background:rgba(0,0,0,.12)}
      .ai-chat-body{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:10px}
      .ai-chat-bubble{max-width:85%;padding:10px 12px;border-radius:14px;font-size:14px;white-space:pre-wrap}
      .ai-chat-bubble.user{margin-left:auto;background:#C8B273;color:#000}
      .ai-chat-bubble.bot{margin-right:auto;background:#111;border:1px solid rgba(200,178,115,.25);color:#f2f2f2}
      .ai-chat-foot{border-top:1px solid rgba(200,178,115,.25);padding:10px;display:flex;gap:8px}
      .ai-chat-input{flex:1;background:#0b0b0b;border:1px solid rgba(200,178,115,.25);border-radius:12px;color:#f2f2f2;
        padding:10px 12px;outline:none}
      .ai-chat-send{background:#C8B273;color:#000;border:0;border-radius:12px;padding:10px 12px;font-weight:900;cursor:pointer}
      .ai-chat-send:disabled{opacity:.5;cursor:not-allowed}
      .ai-chat-note{font-size:11px;color:#bdbdbd;padding:0 12px 10px}
    `;
    const style = el('style', { id: 'ai-chat-styles', text: css });
    document.head.appendChild(style);
  }

  async function askAI(message) {
    const endpoint = getEndpoint();
    if (endpoint.includes('REPLACE_ME')) {
      throw new Error('AI_CHAT_ENDPOINT is not configured');
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('AI endpoint error: ' + res.status);
    const data = await res.json();
    return (data && (data.response || data.answer || data.text)) || '';
  }

  function fallback(message) {
    const m = (message || '').toLowerCase();
    if (m.includes('распис')) {
      return 'Расписание тренировок: Вт/Чт/Сб 20:00–21:30. Запись: +7 (937) 429-11-11';
    }
    if (m.includes('цена') || m.includes('стоим')) {
      return 'Стоимость: Бокс/Фитнес‑бокс — 3,000₽/мес. Boxing Profi — 20,000₽/мес. Запись: +7 (937) 429-11-11';
    }
    if (m.includes('адрес') || m.includes('где') || m.includes('контакт')) {
      return 'Адрес: Пенза, ул. Кураева, 11. Телефон: +7 (937) 429-11-11';
    }
    return 'Я могу помочь с записью на тренировку, ценами, расписанием и товарами магазина. Сформулируйте вопрос чуть конкретнее.';
  }

  function init() {
    injectStyles();

    const btn = el('button', { class: 'ai-chat-btn', 'aria-label': 'Открыть AI‑чат', text: 'AI' });

    const headerLeft = el('div', null, [
      el('div', { class: 'ai-chat-title', text: 'AI Консультант RING' }),
      el('div', { class: 'ai-chat-sub', text: 'онлайн' }),
    ]);

    const closeBtn = el('button', { class: 'ai-chat-close', 'aria-label': 'Закрыть', text: '✕' });
    const header = el('div', { class: 'ai-chat-header' }, [headerLeft, closeBtn]);

    const body = el('div', { class: 'ai-chat-body', role: 'log', 'aria-live': 'polite' });
    const note = el('div', { class: 'ai-chat-note', text: 'Если AI недоступен, включится быстрый режим подсказок.' });

    const input = el('input', { class: 'ai-chat-input', type: 'text', placeholder: 'Напишите сообщение…', 'aria-label': 'Сообщение' });
    const send = el('button', { class: 'ai-chat-send', text: 'Отправить', disabled: 'true', 'aria-label': 'Отправить' });
    const foot = el('div', { class: 'ai-chat-foot' }, [input, send]);

    const panel = el('div', { class: 'ai-chat-panel', role: 'dialog', 'aria-label': 'AI чат' }, [header, body, foot, note]);

    function append(role, text) {
      body.appendChild(el('div', { class: 'ai-chat-bubble ' + role, text }));
      body.scrollTop = body.scrollHeight;
    }

    append('bot', 'Привет! Я AI‑консультант клуба RING. Чем помочь?');

    function setOpen(isOpen) {
      panel.classList.toggle('open', isOpen);
    }

    btn.addEventListener('click', () => setOpen(true));
    closeBtn.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });

    function updateSendState() {
      send.disabled = !input.value.trim();
    }
    input.addEventListener('input', updateSendState);

    async function onSend() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      updateSendState();
      append('user', text);
      try {
        const answer = await askAI(text);
        append('bot', answer || fallback(text));
      } catch (_) {
        append('bot', fallback(text));
      }
    }

    send.addEventListener('click', onSend);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') onSend();
    });

    document.body.appendChild(btn);
    document.body.appendChild(panel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

