# VlaamsCodex / Platskript — User Guide

VlaamsCodex is a parody “dialect language” toolchain for **Platskript** (`.plats`). It transpiles Platskript to Python and can run programs either explicitly via a CLI or implicitly via Python’s source encoding mechanism (“magic mode”).

## Installation

### Recommended: pipx (installs the `plats` CLI)

```bash
python -m pip install --user pipx
python -m pipx ensurepath
pipx install vlaamscodex
```

### Virtualenv: pip (common for development)

```bash
python -m venv .venv
. .venv/bin/activate
python -m pip install -U pip
python -m pip install vlaamscodex
```

### From source (editable)

```bash
python -m venv .venv
. .venv/bin/activate
python -m pip install -U pip
python -m pip install -e .
```

## Running Platskript

### Option A: CLI (always works)

```bash
plats run path/to/program.plats
```

Other useful commands:

```bash
plats show-python path/to/program.plats
plats build path/to/program.plats --out program.py
```

### Option B: “Magic mode” (`python file.plats`)

Platskript files start with a Python encoding declaration:

```text
# coding: vlaamsplats
```

After installing `vlaamscodex`, you can run:

```bash
python path/to/program.plats
```

## Language (v0.1)

Programs are blocks: `plan doe ... gedaan`. Statements end with `amen`.

Supported statements:
- `zet <var> op <expr> amen`
- `klap <expr> amen`
- `maak funksie <name> met <params...> doe ... gedaan`
- `roep <name> met <args...> amen`
- `geeftterug <expr> amen`

Expressions:
- `tekst <words...>` → string literal (words joined with spaces)
- `getal <digits>` → number literal
- `da <name>` → variable reference
- `spatie` → `" "`
- `plakt` → string concatenation (Python `+`)

See `docs/04_language_spec.md` for the canonical spec.

## How it works (high level)

1. Python reads the first line of a source file to detect an encoding (PEP 263).
2. For `.plats`, the first line is `# coding: vlaamsplats`.
3. At interpreter startup, Python’s `site` module processes `.pth` files in site-packages.
4. The installed `vlaamscodex_autoload.pth` runs `import vlaamscodex.codec as _vc; _vc.register()`.
5. The `vlaamsplats` codec compiles Platskript text into valid Python source text, and Python executes that compiled source.

For a deep dive, see `docs/02_how_python_runs_it.md`.

## Limitations & troubleshooting

- `python -S` disables `site`, so `.pth` hooks do not run → magic mode may fail.
- `python -I` (isolated mode) also restricts site/user-site → magic mode may fail.
- If magic mode fails, use `plats run program.plats` (no startup hooks required).

Common error messages:
- `SyntaxError: encoding problem: vlaamsplats` → codec not registered (install package into that environment; avoid `-S`/`-I`).
- `No such file or directory` → the `.plats` file path is wrong.

## Security note

Treat `.plats` as code. Do not execute untrusted `.plats` files automatically.

