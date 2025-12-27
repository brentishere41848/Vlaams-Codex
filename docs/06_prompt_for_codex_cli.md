# 06 — Prompt pack for Codex CLI (copy/paste)

Below is a ready-to-use instruction set you can feed to a code-generation agent (e.g., Codex CLI)
to implement this project properly (beyond the toy reference).

---

You are building a parody programming language called **Platskript** with source extension `.plats`.

Goals:

1) `.plats` is the canonical source format.
2) Users can run scripts with a CLI:
   - `plats run script.plats`
   - `plats build script.plats --out script.py`
3) Optional “magic mode”: after `pip install vlaamscodex` (or chosen name),
   `python script.plats` should work as well.

Mechanism required for goal (3):

- Support a source encoding cookie: the first line of `.plats` is:
  `# coding: vlaamsplats`
- Provide a Python codec named `vlaamsplats` registered via `codecs.register(...)`.
- Ensure the codec is registered at interpreter startup by shipping a `.pth` file installed into
  site-packages (normal startup, not `-S`/`-I`), containing:
  `import vlaamscodex.codec as _vc; _vc.register()`

Implementation requirements:

- Implement a real parser (prefer Lark or a clean recursive-descent parser) and an AST.
- Implement a code generator that produces valid Python source (or Python AST).
- Provide helpful error messages referencing `.plats` line/column.
- Provide minimal standard library keywords:
  - print (`klap`)
  - assignment (`zet X op ...`)
  - function definition (`maak funksie ... doe ... gedaan`)
  - function call (`roep ... met ...`)
  - return (`geeftterug`)
  - if/else/while/for can be added in v0.2

Packaging requirements:

- Provide a console script entry point `plats`.
- Provide unit tests for compiler + CLI.
- Document limitations of the codec approach (`-S`, `-I`, isolated mode).
- Make sure the `.pth` hook does not do heavy work; it should only register the codec.

Deliverables:

- A pip-installable package with `pyproject.toml`.
- Example scripts in `examples/`.
- Docs explaining how and why `python script.plats` works.

Use the toy code in `src/vlaamscodex/` as a starting point, but refactor as needed.
