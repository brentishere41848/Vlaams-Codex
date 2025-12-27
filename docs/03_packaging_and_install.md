# 03 — Packaging & Installation (pip install / pipx install)

This document explains how to ship your Plats tool so someone on another PC can do:

1) Install your tool:
```bash
pip install vlaamscodex
```

2) Run either:
```bash
plats run myscript.plats
```

and optionally:
```bash
python myscript.plats
```

## Recommended packaging goals

Your Python package should provide:

- A normal CLI entry point (console script) named `plats`.
- A custom codec named `vlaamsplats` (or whatever you pick).
- An automatic startup hook so the codec is registered before Python tries to decode `myscript.plats`.

## Folder layout (suggested)

```
project/
  pyproject.toml
  src/
    vlaamscodex/
      __init__.py
      cli.py
      codec.py
      compiler.py
  data/
    vlaamscodex_autoload.pth
  examples/
    hello.plats
```

### What each file does

- `compiler.py`: Plats → Python translation.
- `codec.py`: registers a codec and provides the decoder that calls the compiler.
- `cli.py`: implements `plats run` and `plats build`.
- `vlaamscodex_autoload.pth`: executed by Python’s `site` initialization to register the codec early.

## Console script (CLI) entry point

With PEP 621 metadata in `pyproject.toml`, you can define:

```toml
[project.scripts]
plats = "vlaamscodex.cli:main"
```

Now `pip install` produces a `plats` command on the user’s PATH (or inside the environment).

## Installing the `.pth` file into site-packages

This is the most important packaging detail for `python myscript.plats`.

You want `vlaamscodex_autoload.pth` to end up in site-packages, so Python executes it at startup.

### Approach 1 (common): `data_files` (setuptools)

If you use setuptools, you can place the `.pth` under `data/` and install it to the site-packages directory via `data_files`.

Example `pyproject.toml` (setuptools):

```toml
[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "vlaamscodex"
version = "0.1.0"
requires-python = ">=3.10"

[tool.setuptools]
package-dir = {"" = "src"}

[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.data-files]
"" = ["data/vlaamscodex_autoload.pth"]
```

Notes:
- The exact `data-files` table support can vary by setuptools version; test it.
- Some packaging toolchains discourage `data_files`; but for `.pth` it is a practical approach.

### Approach 2: `sitecustomize.py`

If `.pth` placement becomes painful across build tools, ship a `sitecustomize.py` that imports and registers your codec.

Downside: you must ensure it is importable on startup and avoid interfering with other site customizations.

### Approach 3: drop the requirement

If you are okay with requiring `plats run`, you can skip startup hooks entirely.

## Installation method on another PC

### Option A: pipx (recommended for CLI tools)

```bash
python -m pip install --user pipx
python -m pipx ensurepath
pipx install vlaamscodex
```

This keeps your tool isolated and avoids dependency conflicts.

### Option B: pip inside a venv

```bash
python -m venv .venv
# activate venv
pip install vlaamscodex
plats run myscript.plats
```

## Quick verification checklist

After install:

1) Check the CLI:
```bash
plats --help
```

2) Check the codec-based run:

Create `hello.plats` with the encoding line:

```text
# coding: vlaamsplats
plan doe
  klap tekst gdag aan de weeireld amen
gedaan
```

Then run:

```bash
python hello.plats
```

If it fails with “unknown encoding: vlaamsplats”, your startup hook did not run.

## Publishing to PyPI

Once the package works locally:

- Build:
```bash
python -m build
```

- Upload (e.g., via twine) to PyPI.

Pick a unique package name (many short names are already taken). Common choices:
- `vlaamscodex`
- `platskript`
- `vlaams-plats-runner`

(Always check name availability before you commit to a branding.)
