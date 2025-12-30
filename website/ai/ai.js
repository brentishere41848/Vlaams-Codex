(function () {
    'use strict';

    const elMessages = document.getElementById('messages');
    const elForm = document.getElementById('chatForm');
    const elInput = document.getElementById('chatInput');
    const elSend = document.getElementById('sendBtn');
    const elRetry = document.getElementById('retryBtn');
    const elClear = document.getElementById('clearBtn');
    const elExamples = document.getElementById('examplesBtn');

    const state = {
        messages: [],
        busy: false,
        lastAttempt: null, // { snapshot, assistantMsg, assistantEl }
    };

    const EXAMPLES = [
        "Awel, leg ne keer simpel uit wa Plats is, met nen klein voorbeeld.",
        "Schrijf ne korte Plats-funksie die een lijstje sorteert en toon de output.",
        "Wa zijn de 3 meest voorkomende fouten da beginners maken in Plats?",
    ];

    function scrollToBottom() {
        elMessages.scrollTop = elMessages.scrollHeight;
    }

    function setBusy(busy) {
        state.busy = busy;
        elSend.disabled = busy;
        elInput.disabled = busy;
        elClear.disabled = busy;
        elExamples.disabled = busy;
        elRetry.disabled = busy;
    }

    function splitByCodeFences(text) {
        const parts = [];
        const fence = "```";
        let i = 0;
        while (i < text.length) {
            const start = text.indexOf(fence, i);
            if (start === -1) {
                parts.push({ type: "text", value: text.slice(i) });
                break;
            }
            if (start > i) parts.push({ type: "text", value: text.slice(i, start) });
            const end = text.indexOf(fence, start + fence.length);
            if (end === -1) {
                parts.push({ type: "text", value: text.slice(start) });
                break;
            }
            let code = text.slice(start + fence.length, end);
            code = code.replace(/^\s*[a-z0-9_-]+\s*\n/i, '\n'); // drop optional language tag
            parts.push({ type: "code", value: code.replace(/^\n/, '') });
            i = end + fence.length;
        }
        return parts;
    }

    function renderMessageContent(container, content) {
        const parts = splitByCodeFences(content || '');
        for (const p of parts) {
            if (!p.value) continue;
            if (p.type === 'code') {
                const pre = document.createElement('pre');
                const code = document.createElement('code');
                code.textContent = p.value;
                pre.appendChild(code);
                container.appendChild(pre);
            } else {
                const div = document.createElement('div');
                div.className = 'text';
                div.textContent = p.value;
                container.appendChild(div);
            }
        }
    }

    function addMessage(role, content) {
        const msg = { role, content: content || '' };
        state.messages.push(msg);

        const el = document.createElement('div');
        el.className = `msg ${role === 'user' ? 'user' : 'assistant'}`;
        renderMessageContent(el, msg.content);
        elMessages.appendChild(el);
        scrollToBottom();
        return { msg, el };
    }

    async function typeIntoMessage(el, fullText) {
        el.innerHTML = '';
        const textDiv = document.createElement('div');
        textDiv.className = 'text';
        el.appendChild(textDiv);

        let i = 0;
        const step = () => {
            i = Math.min(fullText.length, i + 8);
            textDiv.textContent = fullText.slice(0, i);
            scrollToBottom();
            if (i < fullText.length) {
                window.requestAnimationFrame(step);
            } else {
                // re-render with code fences after typing completes
                el.innerHTML = '';
                renderMessageContent(el, fullText);
                scrollToBottom();
            }
        };
        step();
    }

    async function send() {
        const text = (elInput.value || '').trim();
        if (!text || state.busy) return;

        elInput.value = '';
        addMessage('user', text);
        setBusy(true);

        const assistant = addMessage('assistant', '...');
        state.lastAttempt = {
            snapshot: state.messages.slice(0, -1), // zonder de placeholder assistant
            assistantMsg: assistant.msg,
            assistantEl: assistant.el,
        };
        elRetry.style.display = 'none';

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: state.lastAttempt.snapshot }),
            });

            if (!res.ok) {
                let msg = "’t Is hier om zeep. Probeer nog ne keer.";
                const contentType = (res.headers.get('content-type') || '').toLowerCase();
                if (contentType.includes('application/json')) {
                    try {
                        const err = await res.json();
                        msg = (err && err.error && err.error.message) ? err.error.message : msg;
                    } catch (_) {}
                } else if (res.status === 404) {
                    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
                        msg = "Da `/api/chat` bestaat hier ni. Start `python -m vlaamscodex.platvlaams_ai.server` en open `http://127.0.0.1:5174/ai/`.";
                    } else {
                        msg = "Da `/api/chat` bestaat hier ni op ’t domein. Op Vercel moet de serverless function mee deployen (zie `vercel.json` + `api/chat.js`).";
                    }
                }
                assistant.msg.content = msg;
                await typeIntoMessage(assistant.el, msg);
                elRetry.style.display = 'inline-flex';
                return;
            }

            const data = await res.json();
            const content = (data && data.message && data.message.content) ? data.message.content : '';
            assistant.msg.content = content || "’t Is hier stil. Probeer nog ne keer.";
            await typeIntoMessage(assistant.el, assistant.msg.content);
            state.lastAttempt = null;
            elRetry.style.display = 'none';
        } catch (_) {
            const msg = "AI is offline, start uw lokaal model.";
            assistant.msg.content = msg;
            await typeIntoMessage(assistant.el, msg);
            elRetry.style.display = 'inline-flex';
        } finally {
            setBusy(false);
            elInput.focus();
        }
    }

    async function retryLast() {
        if (state.busy || !state.lastAttempt) return;
        setBusy(true);
        elRetry.style.display = 'none';

        const { snapshot, assistantMsg, assistantEl } = state.lastAttempt;
        assistantMsg.content = '...';
        assistantEl.innerHTML = '';
        renderMessageContent(assistantEl, assistantMsg.content);
        scrollToBottom();

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: snapshot }),
            });

            if (!res.ok) {
                let msg = "’t Is hier om zeep. Probeer nog ne keer.";
                const contentType = (res.headers.get('content-type') || '').toLowerCase();
                if (contentType.includes('application/json')) {
                    try {
                        const err = await res.json();
                        msg = (err && err.error && err.error.message) ? err.error.message : msg;
                    } catch (_) {}
                } else if (res.status === 404) {
                    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
                        msg = "Da `/api/chat` bestaat hier ni. Start `python -m vlaamscodex.platvlaams_ai.server` en open `http://127.0.0.1:5174/ai/`.";
                    } else {
                        msg = "Da `/api/chat` bestaat hier ni op ’t domein. Op Vercel moet de serverless function mee deployen (zie `vercel.json` + `api/chat.js`).";
                    }
                }
                assistantMsg.content = msg;
                await typeIntoMessage(assistantEl, msg);
                elRetry.style.display = 'inline-flex';
                return;
            }

            const data = await res.json();
            const content = (data && data.message && data.message.content) ? data.message.content : '';
            assistantMsg.content = content || "’t Is hier stil. Probeer nog ne keer.";
            await typeIntoMessage(assistantEl, assistantMsg.content);
            state.lastAttempt = null;
        } catch (_) {
            const msg = "AI is offline, start uw lokaal model.";
            assistantMsg.content = msg;
            await typeIntoMessage(assistantEl, msg);
            elRetry.style.display = 'inline-flex';
        } finally {
            setBusy(false);
            elInput.focus();
        }
    }

    function clearChat() {
        state.messages = [];
        elMessages.innerHTML = '';
        state.lastAttempt = null;
        elRetry.style.display = 'none';
        addMessage('assistant', "Awel. Zeg ne keer wa ge wilt, in ’t Vlaams.");
    }

    function showExamples() {
        const pick = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
        elInput.value = pick;
        elInput.focus();
    }

    elForm.addEventListener('submit', (e) => {
        e.preventDefault();
        send();
    });

    elClear.addEventListener('click', () => clearChat());
    elExamples.addEventListener('click', () => showExamples());
    elRetry.addEventListener('click', () => retryLast());

    clearChat();
})();
