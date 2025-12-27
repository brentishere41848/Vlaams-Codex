# VlaamsCodex – Platskript (VS Code Extension)

Syntax highlighting, snippets, and run commands for **Platskript** (`.plats`), the parody language from **VlaamsCodex**.

## Features

- Language support for `.plats` (language id: `platskript`)
- TextMate-based syntax highlighting (keywords, comments, string-ish `tekst ... amen`, numbers via `getal`)
- Snippets for common patterns (program skeleton, print, functions, if/else, loops)
- Commands:
  - **VlaamsCodex: Run Plats File** (`vlaamscodex.runFile`)
  - **VlaamsCodex: Run Selection as Plats** (`vlaamscodex.runSelection`)
  - **VlaamsCodex: Show Generated Python** (`vlaamscodex.showPython`)
  - **VlaamsCodex: Build Plats to Python File** (`vlaamscodex.buildPython`)
  - **VlaamsCodex: Show CLI Help** (`vlaamscodex.help`)
  - **VlaamsCodex: Show CLI Version** (`vlaamscodex.version`)
- Output is streamed to a dedicated Output Channel: **VlaamsCodex**

## Requirements

- You must have the VlaamsCodex CLI installed so that the `plats` executable is available.
  - Example install: `python -m pip install vlaamscodex` (or `pipx install vlaamscodex`)

## Configuration

This extension exposes one setting:

- `vlaamscodex.platsPath` (string, default: `"plats"`)

Use it if `plats` is not on your PATH or you want to point to a specific executable:

```json
{
  "vlaamscodex.platsPath": "/full/path/to/plats"
}
```

## Usage

### Run current `.plats` file

1. Open a `.plats` file.
2. Run **VlaamsCodex: Run Plats File** from the Command Palette.

This executes:

```text
plats run <current-file>
```

### Run selection

1. Select a block of Plats code in the active editor.
2. Run **VlaamsCodex: Run Selection as Plats**.

The extension writes the selection to a temporary `.plats` file and runs it with `plats run ...`.
If the selection is not a full program, the extension wraps it in a minimal `plan doe ... gedaan` program.

### Show generated Python

Run **VlaamsCodex: Show Generated Python** to execute:

```text
plats show-python <current-file>
```

### Build to a Python file

Run **VlaamsCodex: Build Plats to Python File** to execute:

```text
plats build <current-file> --out <selected-output-path>
```

### Show CLI help / version

Run **VlaamsCodex: Show CLI Help** or **VlaamsCodex: Show CLI Version** to execute:

```text
plats help
plats version
```

## Install from VSIX

1. Build a `.vsix` package (see Development below).
2. In VS Code:
   - Command Palette → **Extensions: Install from VSIX...**
   - Select the generated `.vsix`

## Development

From `vscode-extension/`:

```bash
npm install
npm run compile
npx --yes @vscode/vsce package
```

To run in the Extension Development Host:

1. Open this folder in VS Code.
2. Press **F5** (Run → Start Debugging).
3. In the new window, open a `.plats` file and test the commands.

## Troubleshooting

- **“Could not find the 'plats' executable”**:
  - Install VlaamsCodex in your environment (pip/pipx), or set `vlaamscodex.platsPath`.
- If a run fails:
  - Check the **VlaamsCodex** Output Channel for stderr/stdout.

## License

MIT. See `LICENSE`.
