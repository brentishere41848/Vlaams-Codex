import * as vscode from "vscode";
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

type RunResult = { code: number | null; signal: NodeJS.Signals | null };

function getPlatsPath(): string {
  return vscode.workspace.getConfiguration("vlaamscodex").get<string>("platsPath", "plats");
}

function getWorkingDirectoryForFile(filePath: string): string {
  const folder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
  if (folder) return folder.uri.fsPath;
  return path.dirname(filePath);
}

function getDefaultCwd(): string {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (folder) return folder.uri.fsPath;
  return os.homedir();
}

async function ensureActivePlatsEditor(): Promise<vscode.TextEditor> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    throw new Error("No active editor. Open a .plats file first.");
  }
  const filePath = editor.document.uri.fsPath;
  if (!filePath.endsWith(".plats")) {
    throw new Error("The active file is not a .plats file.");
  }
  return editor;
}

function appendChannelHeader(channel: vscode.OutputChannel, title: string): void {
  const now = new Date().toISOString();
  channel.appendLine("");
  channel.appendLine(`=== ${title} (${now}) ===`);
}

function runPlats(
  channel: vscode.OutputChannel,
  platsPath: string,
  args: string[],
  cwd: string,
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    let child;
    try {
      child = spawn(platsPath, args, { cwd });
    } catch (err) {
      reject(err);
      return;
    }

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    child.stdout.on("data", (chunk: string) => channel.append(chunk));
    child.stderr.on("data", (chunk: string) => channel.append(chunk));

    child.on("error", (err) => reject(err));
    child.on("close", (code, signal) => resolve({ code, signal }));
  });
}

function isSpawnNotFound(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === "ENOENT";
}

async function runPlatsFile(channel: vscode.OutputChannel): Promise<void> {
  const editor = await ensureActivePlatsEditor();
  if (editor.document.isDirty) {
    await editor.document.save();
  }

  const filePath = editor.document.uri.fsPath;
  const platsPath = getPlatsPath();
  const cwd = getWorkingDirectoryForFile(filePath);

  channel.show(true);
  appendChannelHeader(channel, `Run Plats File: ${path.basename(filePath)}`);
  channel.appendLine(`Command: ${platsPath} run ${filePath}`);
  channel.appendLine(`CWD: ${cwd}`);

  try {
    const result = await runPlats(channel, platsPath, ["run", filePath], cwd);
    if (result.code !== 0) {
      void vscode.window.showErrorMessage(`VlaamsCodex failed (exit code ${result.code ?? "unknown"}). See Output: VlaamsCodex.`);
    }
  } catch (err) {
    if (isSpawnNotFound(err)) {
      void vscode.window.showErrorMessage(
        "Could not find the 'plats' executable. Install VlaamsCodex (pipx/pip) or set vlaamscodex.platsPath in Settings.",
      );
    } else {
      void vscode.window.showErrorMessage("Failed to run Plats. See Output: VlaamsCodex.");
    }
    channel.appendLine("");
    channel.appendLine(`Error: ${String(err)}`);
  }
}

function normalizeSelectionText(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

function ensureCodingCookie(text: string): string {
  const trimmed = text.trimStart();
  if (trimmed.startsWith("# coding:")) return text;
  return `# coding: vlaamsplats\n${text}`;
}

function ensureProgramWrapper(text: string): string {
  const hasPlan = /\bplan\s+doe\b/.test(text);
  const hasGedaan = /\bgedaan\b/.test(text);
  if (hasPlan && hasGedaan) return text;

  const body = text
    .split("\n")
    .map((line) => (line.trim().length === 0 ? "" : `  ${line}`))
    .join("\n");
  return `plan doe\n${body}\n\ngedaan\n`;
}

async function runPlatsSelection(channel: vscode.OutputChannel): Promise<void> {
  const editor = await ensureActivePlatsEditor();

  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);
  if (!selectedText || selectedText.trim().length === 0) {
    void vscode.window.showInformationMessage("Select some Plats code first.");
    return;
  }

  const filePath = editor.document.uri.fsPath;
  const cwd = getWorkingDirectoryForFile(filePath);
  const platsPath = getPlatsPath();

  const normalized = normalizeSelectionText(selectedText);
  const wrapped = ensureProgramWrapper(normalized);
  const withCookie = ensureCodingCookie(wrapped);

  const tmpFile = path.join(os.tmpdir(), `vlaamscodex-selection-${Date.now()}-${Math.random().toString(16).slice(2)}.plats`);
  await fs.writeFile(tmpFile, withCookie, { encoding: "utf8" });

  channel.show(true);
  appendChannelHeader(channel, `Run Selection as Plats: ${path.basename(filePath)}`);
  channel.appendLine(`Temp file: ${tmpFile}`);
  channel.appendLine(`Command: ${platsPath} run ${tmpFile}`);
  channel.appendLine(`CWD: ${cwd}`);

  try {
    const result = await runPlats(channel, platsPath, ["run", tmpFile], cwd);
    if (result.code !== 0) {
      void vscode.window.showErrorMessage(`VlaamsCodex failed (exit code ${result.code ?? "unknown"}). See Output: VlaamsCodex.`);
    }
  } catch (err) {
    if (isSpawnNotFound(err)) {
      void vscode.window.showErrorMessage(
        "Could not find the 'plats' executable. Install VlaamsCodex (pipx/pip) or set vlaamscodex.platsPath in Settings.",
      );
    } else {
      void vscode.window.showErrorMessage("Failed to run selection. See Output: VlaamsCodex.");
    }
    channel.appendLine("");
    channel.appendLine(`Error: ${String(err)}`);
  } finally {
    try {
      await fs.unlink(tmpFile);
    } catch {
      // ignore
    }
  }
}

async function showGeneratedPython(channel: vscode.OutputChannel): Promise<void> {
  const editor = await ensureActivePlatsEditor();
  if (editor.document.isDirty) {
    await editor.document.save();
  }

  const filePath = editor.document.uri.fsPath;
  const platsPath = getPlatsPath();
  const cwd = getWorkingDirectoryForFile(filePath);

  channel.show(true);
  appendChannelHeader(channel, `Show Generated Python: ${path.basename(filePath)}`);
  channel.appendLine(`Command: ${platsPath} show-python ${filePath}`);
  channel.appendLine(`CWD: ${cwd}`);

  try {
    const result = await runPlats(channel, platsPath, ["show-python", filePath], cwd);
    if (result.code !== 0) {
      void vscode.window.showErrorMessage(`VlaamsCodex failed (exit code ${result.code ?? "unknown"}). See Output: VlaamsCodex.`);
    }
  } catch (err) {
    if (isSpawnNotFound(err)) {
      void vscode.window.showErrorMessage(
        "Could not find the 'plats' executable. Install VlaamsCodex (pipx/pip) or set vlaamscodex.platsPath in Settings.",
      );
    } else {
      void vscode.window.showErrorMessage("Failed to show generated Python. See Output: VlaamsCodex.");
    }
    channel.appendLine("");
    channel.appendLine(`Error: ${String(err)}`);
  }
}

async function buildPlatsToPythonFile(channel: vscode.OutputChannel): Promise<void> {
  const editor = await ensureActivePlatsEditor();
  if (editor.document.isDirty) {
    await editor.document.save();
  }

  const filePath = editor.document.uri.fsPath;
  const platsPath = getPlatsPath();
  const cwd = getWorkingDirectoryForFile(filePath);

  const defaultOut = filePath.replace(/\.plats$/i, ".py");
  const outUri = await vscode.window.showSaveDialog({
    title: "Build Plats to Python",
    defaultUri: vscode.Uri.file(defaultOut),
    filters: { Python: ["py"] },
  });
  if (!outUri) return;

  channel.show(true);
  appendChannelHeader(channel, `Build Plats to Python: ${path.basename(filePath)}`);
  channel.appendLine(`Command: ${platsPath} build ${filePath} --out ${outUri.fsPath}`);
  channel.appendLine(`CWD: ${cwd}`);

  try {
    const result = await runPlats(channel, platsPath, ["build", filePath, "--out", outUri.fsPath], cwd);
    if (result.code !== 0) {
      void vscode.window.showErrorMessage(`VlaamsCodex failed (exit code ${result.code ?? "unknown"}). See Output: VlaamsCodex.`);
    } else {
      void vscode.window.showInformationMessage(`Built Python file: ${outUri.fsPath}`);
    }
  } catch (err) {
    if (isSpawnNotFound(err)) {
      void vscode.window.showErrorMessage(
        "Could not find the 'plats' executable. Install VlaamsCodex (pipx/pip) or set vlaamscodex.platsPath in Settings.",
      );
    } else {
      void vscode.window.showErrorMessage("Failed to build Python file. See Output: VlaamsCodex.");
    }
    channel.appendLine("");
    channel.appendLine(`Error: ${String(err)}`);
  }
}

async function showCliHelp(channel: vscode.OutputChannel): Promise<void> {
  const platsPath = getPlatsPath();
  const cwd = getDefaultCwd();

  channel.show(true);
  appendChannelHeader(channel, "Plats CLI Help");
  channel.appendLine(`Command: ${platsPath} help`);
  channel.appendLine(`CWD: ${cwd}`);

  try {
    const result = await runPlats(channel, platsPath, ["help"], cwd);
    if (result.code !== 0) {
      void vscode.window.showErrorMessage(`VlaamsCodex failed (exit code ${result.code ?? "unknown"}). See Output: VlaamsCodex.`);
    }
  } catch (err) {
    if (isSpawnNotFound(err)) {
      void vscode.window.showErrorMessage(
        "Could not find the 'plats' executable. Install VlaamsCodex (pipx/pip) or set vlaamscodex.platsPath in Settings.",
      );
    } else {
      void vscode.window.showErrorMessage("Failed to show CLI help. See Output: VlaamsCodex.");
    }
    channel.appendLine("");
    channel.appendLine(`Error: ${String(err)}`);
  }
}

async function showCliVersion(channel: vscode.OutputChannel): Promise<void> {
  const platsPath = getPlatsPath();
  const cwd = getDefaultCwd();

  channel.show(true);
  appendChannelHeader(channel, "Plats CLI Version");
  channel.appendLine(`Command: ${platsPath} version`);
  channel.appendLine(`CWD: ${cwd}`);

  try {
    const result = await runPlats(channel, platsPath, ["version"], cwd);
    if (result.code !== 0) {
      void vscode.window.showErrorMessage(`VlaamsCodex failed (exit code ${result.code ?? "unknown"}). See Output: VlaamsCodex.`);
    }
  } catch (err) {
    if (isSpawnNotFound(err)) {
      void vscode.window.showErrorMessage(
        "Could not find the 'plats' executable. Install VlaamsCodex (pipx/pip) or set vlaamscodex.platsPath in Settings.",
      );
    } else {
      void vscode.window.showErrorMessage("Failed to show CLI version. See Output: VlaamsCodex.");
    }
    channel.appendLine("");
    channel.appendLine(`Error: ${String(err)}`);
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const channel = vscode.window.createOutputChannel("VlaamsCodex");

  context.subscriptions.push(
    channel,
    vscode.commands.registerCommand("vlaamscodex.runFile", () => runPlatsFile(channel)),
    vscode.commands.registerCommand("vlaamscodex.runSelection", () => runPlatsSelection(channel)),
    vscode.commands.registerCommand("vlaamscodex.showPython", () => showGeneratedPython(channel)),
    vscode.commands.registerCommand("vlaamscodex.buildPython", () => buildPlatsToPythonFile(channel)),
    vscode.commands.registerCommand("vlaamscodex.help", () => showCliHelp(channel)),
    vscode.commands.registerCommand("vlaamscodex.version", () => showCliVersion(channel)),
  );
}

export function deactivate(): void {
  // no-op
}
