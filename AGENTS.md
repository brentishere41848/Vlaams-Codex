# Repository Guidelines

## Project Structure & Module Organization
- `src/vlaamscodex/` contains the reference implementation (codec, compiler, CLI).
- `examples/` includes sample `.plats` programs (start with `examples/hello.plats`).
- `docs/` holds the design notes, packaging guidance, and language spec.
- `data/` ships runtime artifacts like the `.pth` startup hook.
- `pyproject.toml.example` is a packaging template (not active config).

## Build, Test, and Development Commands
- `plats run examples/hello.plats` compiles and executes a Platskript script.
- `plats build examples/hello.plats --out /tmp/hello.py` writes generated Python.
- `plats show-python examples/hello.plats` prints the generated Python to stdout.
- `python -m build` builds sdist/wheel when a real `pyproject.toml` is present.

## Coding Style & Naming Conventions
- Python 3.10+ features are used (see `pyproject.toml.example`).
- Keep modules small and single-purpose (`codec.py`, `compiler.py`, `cli.py`).
- Use 4-space indentation and `snake_case` for functions/vars; `PascalCase` for classes.
- Favor explicit types in public APIs; keep helpers prefixed with `_`.

## Testing Guidelines
- No automated test suite is present yet. If you add one, document it here.
- Suggested start: `tests/` with `pytest`, naming files `test_*.py`.

## Commit & Pull Request Guidelines
- No Git history is available in this repo, so no commit convention is enforced.
- For PRs, include a short summary, reproduction steps (if applicable), and sample `.plats` input/output.

## Security & Configuration Notes
- Treat untrusted `.plats` files as code: don’t execute automatically.
- If enabling “magic mode” (`python script.plats`), ensure the `.pth` hook installs correctly.
