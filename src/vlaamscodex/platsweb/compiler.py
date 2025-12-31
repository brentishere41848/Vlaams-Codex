from __future__ import annotations

from dataclasses import dataclass
import json
import re

from .errors import PlatsWebParseError
from .parser import parse_plats_sfc


@dataclass(frozen=True)
class PlatsWebBuildOutput:
    index_html: str
    app_js: str
    app_css: str


_TAG_MAP: dict[str, tuple[str, str | None]] = {
    "blok": ("div", None),
    "rij": ("div", "rij"),
    "kolom": ("div", "kolom"),
    "kop": ("h1", None),
    "tekst": ("p", None),
    "knop": ("button", None),
    "invoer": ("input", None),
}

_ALLOWED_ATTRS = {"id", "class", "placeholder", "tekst"}


def _parse_attrs(s: str, line: int, col_base: int) -> dict[str, str]:
    attrs: dict[str, str] = {}
    # key:"value" pairs, value supports simple escapes
    rx = re.compile(r'([A-Za-z_][A-Za-z0-9_]*)\s*:\s*"((?:\\.|[^"\\])*)"')
    pos = 0
    while pos < len(s):
        m = rx.search(s, pos)
        if not m:
            tail = s[pos:].strip()
            if tail:
                raise PlatsWebParseError(f"invalid attribute syntax near: {tail!r}", line, col_base + pos + 1)
            break
        key = m.group(1)
        if key not in _ALLOWED_ATTRS:
            raise PlatsWebParseError(f"unknown attribute '{key}'", line, col_base + m.start(1) + 1)
        val = _unescape_attr_value(m.group(2))
        attrs[key] = val
        pos = m.end()
    return attrs


def _unescape_attr_value(s: str) -> str:
    # Minimal string unescape that preserves UTF-8 characters:
    # supports: \\ \" \n \r \t
    out: list[str] = []
    i = 0
    while i < len(s):
        ch = s[i]
        if ch != "\\":
            out.append(ch)
            i += 1
            continue
        i += 1
        if i >= len(s):
            out.append("\\")
            break
        esc = s[i]
        i += 1
        if esc == "n":
            out.append("\n")
        elif esc == "r":
            out.append("\r")
        elif esc == "t":
            out.append("\t")
        elif esc == '"':
            out.append('"')
        elif esc == "\\":
            out.append("\\")
        else:
            out.append(esc)
    return "".join(out)


def _merge_class(existing: str | None, add: str | None) -> str | None:
    parts: list[str] = []
    if existing:
        parts.append(existing.strip())
    if add:
        parts.append(add.strip())
    merged = " ".join([p for p in parts if p])
    return merged or None


def _parse_pagina_markup(pagina: str, line_offset: int = 1) -> list[dict]:
    root: list[dict] = []
    stack: list[list[dict]] = [root]

    lines = pagina.splitlines()
    for idx, raw in enumerate(lines, start=1):
        file_line = line_offset + idx - 1
        line = raw.strip()
        if not line or line.startswith("#") or line.startswith("//"):
            continue

        if line == "}":
            if len(stack) == 1:
                raise PlatsWebParseError("unexpected '}'", file_line, 1)
            stack.pop()
            continue

        has_children = False
        if line.endswith("{"):
            has_children = True
            line = line[:-1].rstrip()

        parts = line.split(None, 1)
        if not parts:
            continue
        kind = parts[0]
        if kind not in _TAG_MAP:
            raise PlatsWebParseError(f"unknown markup node '{kind}'", file_line, 1)

        rest = parts[1] if len(parts) > 1 else ""
        attrs = _parse_attrs(rest, file_line, col_base=1 + len(kind) + 1)

        html_tag, implied_class = _TAG_MAP[kind]
        if implied_class:
            attrs["class"] = _merge_class(attrs.get("class"), implied_class) or implied_class

        tekst = attrs.pop("tekst", None)

        if kind == "invoer" and has_children:
            raise PlatsWebParseError("'invoer' cannot have children", file_line, 1)

        node: dict = {"t": "el", "tag": html_tag, "attrs": {}, "kids": []}

        if "id" in attrs:
            node["attrs"]["id"] = attrs["id"]
        if "class" in attrs:
            node["attrs"]["class"] = attrs["class"]
        if "placeholder" in attrs:
            if kind != "invoer":
                raise PlatsWebParseError("'placeholder' is only valid for 'invoer'", file_line, 1)
            node["attrs"]["placeholder"] = attrs["placeholder"]

        if kind == "invoer":
            if tekst is not None:
                node["attrs"]["value"] = tekst
        else:
            if tekst is not None:
                node["kids"].append({"t": "text", "v": tekst})

        stack[-1].append(node)
        if has_children:
            stack.append(node["kids"])

    if len(stack) != 1:
        raise PlatsWebParseError("unclosed '{' in pagina markup", line_offset + len(lines) - 1, 1)

    return root


def _parse_script(script: str, line_offset: int = 1) -> tuple[dict[str, str], list[dict], list[dict]]:
    """
    Returns (initial_state, functions, events).
    - initial_state: name -> js expr
    - functions: {name, params, body}
    - events: {type, selector, handler}
    """
    initial_state: dict[str, str] = {}
    functions: list[dict] = []
    events: list[dict] = []

    i = 0
    while i < len(script):
        # skip whitespace
        if script[i].isspace():
            i += 1
            continue
        # line comments
        if script[i] == "#":
            while i < len(script) and script[i] != "\n":
                i += 1
            continue
        if script[i] == "/" and i + 1 < len(script) and script[i + 1] == "/":
            while i < len(script) and script[i] != "\n":
                i += 1
            continue

        # read line-ish token
        if script.startswith("staat", i):
            end = script.find("\n", i)
            if end == -1:
                end = len(script)
            line = script[i:end].strip().rstrip(";")
            m = re.match(r"staat\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$", line)
            if not m:
                raise PlatsWebParseError("invalid 'staat' syntax (expected: staat naam = waarde)", line_offset, 1)
            name = m.group(1)
            expr = m.group(2).strip()
            expr = re.sub(r"\bwaar\b", "true", expr)
            expr = re.sub(r"\bonwaar\b", "false", expr)
            initial_state[name] = expr
            i = end + 1
            continue

        if script.startswith("bij", i):
            end = script.find("\n", i)
            if end == -1:
                end = len(script)
            line = script[i:end].strip().rstrip(";")
            m = re.match(r'bij\s+(klik|input)\s+"([^"]+)"\s*->\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(\s*\))?\s*$', line)
            if not m:
                raise PlatsWebParseError("invalid 'bij' syntax (expected: bij klik \"#id\" -> functieNaam())", line_offset, 1)
            ev_type = "click" if m.group(1) == "klik" else m.group(1)
            events.append({"type": ev_type, "selector": m.group(2), "handler": m.group(3)})
            i = end + 1
            continue

        if script.startswith("functie", i):
            header_end = script.find("{", i)
            if header_end == -1:
                raise PlatsWebParseError("function missing '{'", line_offset, 1)
            header = script[i:header_end].strip()
            m = re.match(r"functie\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*$", header)
            if not m:
                raise PlatsWebParseError("invalid function syntax (expected: functie naam(a, b) { ... })", line_offset, 1)
            name = m.group(1)
            params = [p.strip() for p in m.group(2).split(",") if p.strip()]

            body, next_i = _extract_js_brace_body(script, header_end, line_offset=line_offset)
            body_js = _translate_script_body(body)
            functions.append({"name": name, "params": params, "body": body_js})
            i = next_i
            continue

        # unknown statement: skip to next line
        end = script.find("\n", i)
        if end == -1:
            break
        i = end + 1

    return initial_state, functions, events


def _extract_js_brace_body(src: str, brace_i: int, line_offset: int = 1) -> tuple[str, int]:
    # brace_i points to '{'
    i = brace_i + 1
    depth = 1
    in_string: str | None = None
    escaped = False
    start = i

    while i < len(src):
        ch = src[i]
        if in_string is not None:
            if escaped:
                escaped = False
                i += 1
                continue
            if ch == "\\":
                escaped = True
                i += 1
                continue
            if ch == in_string:
                in_string = None
                i += 1
                continue
            i += 1
            continue

        if ch in ("'", '"', "`"):
            in_string = ch
            i += 1
            continue
        if ch == "{":
            depth += 1
            i += 1
            continue
        if ch == "}":
            depth -= 1
            if depth == 0:
                return src[start:i], i + 1
            i += 1
            continue
        i += 1

    raise PlatsWebParseError("unclosed function body '{...}'", line_offset, 1)


def _translate_script_body(body: str) -> str:
    out_lines: list[str] = []
    for raw in body.splitlines():
        line = raw.rstrip()
        stripped = line.strip()
        if not stripped:
            out_lines.append("")
            continue

        m = re.match(r"staat\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$", stripped)
        if m:
            name = m.group(1)
            expr = m.group(2).rstrip(";").strip()
            expr = re.sub(r"\bwaar\b", "true", expr)
            expr = re.sub(r"\bonwaar\b", "false", expr)
            expr = re.sub(r"\blees\s*\(", "helpers.lees(", expr)
            expr = re.sub(r"\bzet\s*\(", "helpers.zet(", expr)
            out_lines.append(f"setState({{{name}: {expr}}});")
            continue

        # helpers
        line = re.sub(r"\blees\s*\(", "helpers.lees(", line)
        line = re.sub(r"\bzet\s*\(", "helpers.zet(", line)
        out_lines.append(line)
    return "\n".join(out_lines).strip()


def _compile_app_js(template_nodes: list[dict], initial_state: dict[str, str], functions: list[dict], events: list[dict]) -> str:
    tpl_json = json.dumps(template_nodes, ensure_ascii=False)
    state_entries = ",\n  ".join([f"{k}: {v}" for k, v in initial_state.items()])
    if not state_entries:
        state_entries = ""

    fn_chunks: list[str] = []
    fn_names = set()
    for f in functions:
        fn_names.add(f["name"])
        params = ", ".join(f["params"])
        body = f["body"]
        fn_chunks.append(f"function {f['name']}({params}) {{\n{_indent(body, 2)}\n}}")

    for ev in events:
        if ev["handler"] not in fn_names:
            raise PlatsWebParseError(f"event handler '{ev['handler']}' is not defined as a functie()", 1, 1)

    events_json = json.dumps(events, ensure_ascii=False)
    handlers_obj = ", ".join(sorted(fn_names))
    fn_block = "\n\n  ".join(fn_chunks).rstrip()

    return f"""// Generated by VlaamsCodex PlatsWeb (MVP)
(() => {{
  'use strict';

  const root = document.getElementById('plats-root');
  if (!root) {{
    console.error('[platsweb] missing #plats-root');
    return;
  }}

  const TEMPLATE = {tpl_json};

  const state = {{
  {state_entries}
  }};
  const staat = state;

  function escapeHtml(value) {{
    const s = value == null ? '' : String(value);
    return s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('\"', '&quot;')
      .replaceAll(\"'\", '&#39;');
  }}

  function renderText(raw) {{
    const s = raw == null ? '' : String(raw);
    let out = '';
    let last = 0;
    const re = /\\{{\\{{\\s*([A-Za-z_][A-Za-z0-9_]*)\\s*\\}}\\}}/g;
    let m;
    while ((m = re.exec(s))) {{
      const before = s.slice(last, m.index);
      if (before) out += escapeHtml(before);
      const key = m[1];
      out += escapeHtml(state[key] ?? '');
      last = m.index + m[0].length;
    }}
    const tail = s.slice(last);
    if (tail) out += escapeHtml(tail);
    return out;
  }}

  function renderAttrs(attrs) {{
    if (!attrs) return '';
    let out = '';
    for (const [k, v] of Object.entries(attrs)) {{
      if (v == null) continue;
      out += ` ${{k}}="${{renderText(v)}}"`;
    }}
    return out;
  }}

  function renderNode(node) {{
    if (!node) return '';
    if (node.t === 'text') return renderText(node.v);
    if (node.t === 'el') {{
      const tag = node.tag;
      const attrs = renderAttrs(node.attrs);
      if (tag === 'input') {{
        return `<${{tag}}${{attrs}}>`;
      }}
      let inner = '';
      if (node.kids && node.kids.length) {{
        for (const child of node.kids) inner += renderNode(child);
      }}
      return `<${{tag}}${{attrs}}>${{inner}}</${{tag}}>`;
    }}
    return '';
  }}

  function render() {{
    let html = '';
    for (const n of TEMPLATE) html += renderNode(n);
    root.innerHTML = html;
  }}

  function setState(patch) {{
    Object.assign(state, patch || {{}});
    render();
  }}

  const helpers = {{
    lees(selector) {{
      const el = root.querySelector(selector);
      if (!el) return '';
      if ('value' in el) return el.value;
      return el.textContent ?? '';
    }},
    zet(selector, value) {{
      const el = root.querySelector(selector);
      if (!el) return;
      if ('value' in el) el.value = value ?? '';
      else el.textContent = value ?? '';
    }},
    state,
    staat,
    setState,
  }};

  {fn_block}

  const handlers = {{ {handlers_obj} }};

  function bindEvents() {{
    const specs = {events_json};
    for (const spec of specs) {{
      const type = spec.type;
      const selector = spec.selector;
      const handlerName = spec.handler;
      const handler = handlers[handlerName];
      if (typeof handler !== 'function') {{
        console.error(`[platsweb] missing handler: ${{handlerName}}`);
        continue;
      }}
      root.addEventListener(type, (evt) => {{
        const target = evt.target && evt.target.closest ? evt.target.closest(selector) : null;
        if (!target || !root.contains(target)) return;
        handler();
      }});
    }}
  }}

  render();
  bindEvents();
}})();
"""


def _indent(s: str, spaces: int) -> str:
    pad = " " * spaces
    return "\n".join((pad + ln) if ln.strip() else "" for ln in s.splitlines())


def _compile_index_html(dev: bool) -> str:
    dev_snippet = ""
    if dev:
        dev_snippet = """
    <script>
      (() => {
        try {
          const es = new EventSource('/__platsweb_events');
          es.onmessage = () => location.reload();
        } catch {}
      })();
    </script>""".rstrip()

    return f"""<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>PlatsWeb</title>
    <link rel="stylesheet" href="./app.css">
  </head>
  <body>
    <div id="plats-root"></div>
    <script src="./app.js" defer></script>
{dev_snippet}
  </body>
</html>
"""


def build_platsweb(sfc_src: str, dev: bool = False) -> PlatsWebBuildOutput:
    sfc = parse_plats_sfc(sfc_src)
    template_nodes = _parse_pagina_markup(sfc.pagina.text, line_offset=sfc.pagina.start_line)
    initial_state, functions, events = _parse_script(sfc.script.text, line_offset=sfc.script.start_line)

    index_html = _compile_index_html(dev=dev)
    app_js = _compile_app_js(template_nodes, initial_state, functions, events)
    stijl = sfc.stijl.text.strip()
    app_css = (stijl + "\n") if stijl else ""
    return PlatsWebBuildOutput(index_html=index_html, app_js=app_js, app_css=app_css)
