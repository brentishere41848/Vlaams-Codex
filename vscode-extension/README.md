# Vlaams Codex – Platskript (VS Code Extension)

Syntax highlighting, snippets, and run/build tools for **Platskript** (`.plats`), the **Vlaams Codex** parody language.

## Features

- Language support for `.plats` (language id: `platskript`)
- TextMate-based syntax highlighting (keywords, comments, `tekst ... amen`, numbers via `getal`)
- Snippets for common patterns (program skeleton, print, functions, if/else, loops)
- Commands (Output Channel: **VlaamsCodex**):
  - **VlaamsCodex: Run Plats File**
  - **VlaamsCodex: Run Selection as Plats**
  - **VlaamsCodex: Show Generated Python**
  - **VlaamsCodex: Build Plats to Python File**
  - **VlaamsCodex: Show CLI Help**
  - **VlaamsCodex: Show CLI Version**

## Requirements

- Install VlaamsCodex so the `plats` executable is available.
  - Example: `python -m pip install vlaamscodex` (or `pipx install vlaamscodex`)

## Configuration

- `vlaamscodex.platsPath` (default: `"plats"`) — path to the `plats` executable.

## Usage

- Run file: Command Palette → **VlaamsCodex: Run Plats File**
- Run selection: Command Palette → **VlaamsCodex: Run Selection as Plats**
- Show Python: Command Palette → **VlaamsCodex: Show Generated Python**
- Build: Command Palette → **VlaamsCodex: Build Plats to Python File**
- Help/version: Command Palette → **VlaamsCodex: Show CLI Help** / **VlaamsCodex: Show CLI Version**

## Install from VSIX

Command Palette → **Extensions: Install from VSIX...**

## Development

```bash
npm install
npm run compile
npx --yes @vscode/vsce package
```

Press **F5** in VS Code to start an Extension Development Host.

## License

MIT. See `LICENSE`.

