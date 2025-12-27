# 01 — Overview

## What you are building

You are building a parody “dialect language” called **Platskript**:

- Users write source code using Flemish/dialect words instead of mainstream programming syntax.
- The canonical source file extension is **`.plats`**.
- A toolchain translates Platskript into real executable code (Python in this reference implementation).

## The two different goals people often mix up

1) **Display**: “When I open the file on another PC, it should still show Plats code.”
   - If the file is text, this is already true. Any editor will show your Plats words.

2) **Execution**: “When I run the file on another PC, it should execute.”
   - This requires either:
     - installing a **runtime/runner** (“like Python is required to run Python code”), or
     - compiling/bundling into a **standalone executable**.

Your specific requirement is even stricter:

- After installing your tool, running `python myscript.plats` should execute the Plats source.

This pack documents how to achieve that.

## What this pack implements

This ZIP includes:

- A **toy Plats → Python compiler/transpiler** (enough to demonstrate the mechanism).
- A Python **custom source encoding** (“codec”) that compiles Plats to Python at load time.
- A small CLI (`plats`) to run/build scripts in the normal, explicit way.

This is the recommended architecture:

```
.plats (canonical source)
   ↓ parse + compile to Python source
Python source
   ↓ exec
running program
```

And for the special `python myscript.plats` trick, the compilation happens inside a custom decoder:

```
python sees: # coding: vlaamsplats
   ↓ uses the vlaamsplats codec to decode the file
codec.decode(): Plats → Python
   ↓ returns Python source text
Python parses + executes it
```

## Components you need for a real project

### 1) Language spec (small but explicit)
Define a grammar and rules for:
- statements (end marker: `amen`)
- blocks (`doe ... gedaan`)
- strings (`tekst ...`)
- variables (`da name`)
- operators (`plakt`, etc.)

Even for a parody, a clear spec prevents “prompt drift”.

### 2) Parser / compiler front-end
Turn Plats text into an AST (abstract syntax tree). The toy compiler in this ZIP does a lightweight parse; a production version should use a real parser generator (e.g., Lark/ANTLR) or a structured recursive-descent parser.

### 3) Back-end codegen
Generate Python source or Python AST (recommended once the language grows).

### 4) Runner + packaging
Provide a CLI (e.g., `plats run`, `plats build`) and package it so other PCs can install it easily.

### 5) Editor support (optional but makes it “feel real”)
VS Code extension / language server for:
- syntax highlighting for `.plats`
- formatting
- diagnostics

## Where to read next

- `docs/02_how_python_runs_it.md` — the exact reason `python myscript.plats` can work
- `docs/03_packaging_and_install.md` — how to ship this as a pip-installable tool
- `docs/04_language_spec.md` — a compact starter spec for Platskript
