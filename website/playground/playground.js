/* global loadPyodide */

const PYODIDE_VERSION = 'v0.26.2';
const VLAAMSCODEX_VERSION = '0.2.5';
const VLAAMSCODEX_WHEEL_PATH = `../assets/py/vlaamscodex-${VLAAMSCODEX_VERSION}-py3-none-any.whl`;
const VLAAMSCODEX_WHEEL_CACHE_BUST = '2025-12-28-04';

const elements = {
    editor: document.getElementById('editor'),
    output: document.getElementById('output'),
    runBtn: document.getElementById('runBtn'),
    copyBtn: document.getElementById('copyBtn'),
    clearBtn: document.getElementById('clearBtn'),
    runtimeStatus: document.getElementById('runtimeStatus'),
    editorTitle: document.getElementById('editorTitle'),
    hintLine: document.getElementById('hintLine'),
};

function setStatus(text) {
    if (elements.runtimeStatus) elements.runtimeStatus.textContent = `Runtime: ${text}`;
}

function appendOutput(text) {
    if (!elements.output) return;
    elements.output.textContent += text;
}

function setOutput(text) {
    if (!elements.output) return;
    elements.output.textContent = text;
}

function getQuery() {
    const params = new URLSearchParams(window.location.search);
    return {
        example: params.get('example') || '',
    };
}

async function fetchExampleCode(example) {
    const res = await fetch(`../examples/code-blocks/${encodeURIComponent(example)}.html`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Example not found: ${example}`);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const codeEl = doc.querySelector('#codeBlock');
    if (!codeEl) throw new Error(`Code block missing in example: ${example}`);
    return codeEl.textContent || '';
}

let pyodidePromise = null;

async function ensurePyodide() {
    if (pyodidePromise) return pyodidePromise;

    pyodidePromise = (async () => {
        setStatus('loading pyodide');
        if (!window.loadPyodide) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/pyodide.js`;
                script.onload = resolve;
                script.onerror = () => reject(new Error('Failed to load Pyodide script'));
                document.head.appendChild(script);
            });
        }

        const pyodide = await window.loadPyodide({
            indexURL: `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`,
        });

        setStatus('loading micropip');
        await pyodide.loadPackage('micropip');

        const wheelUrl = new URL(`${VLAAMSCODEX_WHEEL_PATH}?v=${encodeURIComponent(VLAAMSCODEX_WHEEL_CACHE_BUST)}`, window.location.href).toString();

        setStatus(`installing vlaamscodex ${VLAAMSCODEX_VERSION}`);
        try {
            await pyodide.runPythonAsync(`
import micropip
await micropip.install(${JSON.stringify(wheelUrl)})
        `.trim());
        } catch {
            await pyodide.runPythonAsync(`
import micropip
await micropip.install("vlaamscodex==${VLAAMSCODEX_VERSION}")
            `.trim());
        }

        setStatus('ready');
        return pyodide;
    })();

    return pyodidePromise;
}

async function runPlats(code) {
    const pyodide = await ensurePyodide();
    const escaped = JSON.stringify(code);

    const result = await pyodide.runPythonAsync(`
import io
from contextlib import redirect_stdout, redirect_stderr
from vlaamscodex.compiler import compile_plats

_src = ${escaped}
_py = compile_plats(_src)

_out = io.StringIO()
_err = io.StringIO()
_globals = {}

with redirect_stdout(_out), redirect_stderr(_err):
    exec(_py, _globals, _globals)

_out.getvalue() + _err.getvalue()
    `.trim());

    return result;
}

async function handleRun() {
    const code = elements.editor?.value ?? '';
    setOutput('');
    try {
        elements.runBtn.disabled = true;
        setStatus('running');
        const out = await runPlats(code);
        setOutput(out || '');
        setStatus('ready');
    } catch (e) {
        setStatus('error');
        const msg = (e && e.message) ? e.message : String(e);
        appendOutput(`\n❌ Fout: ${msg}\n`);
    } finally {
        elements.runBtn.disabled = false;
    }
}

function wireUi() {
    if (elements.copyBtn && elements.editor) {
        elements.copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(elements.editor.value);
                elements.copyBtn.textContent = 'Copied!';
                setTimeout(() => { elements.copyBtn.textContent = 'Copy'; }, 1200);
            } catch {
                elements.copyBtn.textContent = 'Copy failed';
                setTimeout(() => { elements.copyBtn.textContent = 'Copy'; }, 1200);
            }
        });
    }

    if (elements.clearBtn) {
        elements.clearBtn.addEventListener('click', () => setOutput(''));
    }

    if (elements.runBtn) {
        elements.runBtn.addEventListener('click', handleRun);
    }
}

async function initFromQuery() {
    const { example } = getQuery();
    if (!example) {
        setStatus('idle');
        return;
    }

    try {
        if (elements.editorTitle) elements.editorTitle.textContent = `Code (${example})`;
        if (elements.hintLine) elements.hintLine.textContent = `Loaded example: ${example}`;
        const code = await fetchExampleCode(example);
        if (elements.editor) elements.editor.value = code;
        await handleRun();
    } catch (e) {
        setStatus('error');
        const msg = (e && e.message) ? e.message : String(e);
        appendOutput(`❌ Kon voorbeeld nie lade: ${msg}\n`);
    }
}

wireUi();
initFromQuery();
